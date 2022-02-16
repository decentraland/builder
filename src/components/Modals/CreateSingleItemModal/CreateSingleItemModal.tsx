import * as React from 'react'
import { basename } from 'path'
import uuid from 'uuid'
import JSZip from 'jszip'
import future from 'fp-future'
import {
  ModalNavigation,
  Row,
  Column,
  Button,
  Form,
  Field,
  Section,
  Header,
  InputOnChangeData,
  SelectField,
  DropdownProps
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { cleanAssetName } from 'modules/asset/utils'
import { blobToDataURL, dataURLToBlob } from 'modules/media/utils'
import {
  ITEM_EXTENSIONS,
  THUMBNAIL_PATH,
  Item,
  ItemType,
  WearableBodyShape,
  BodyShapeType,
  WearableCategory,
  ItemRarity,
  ITEM_NAME_MAX_LENGTH,
  WearableRepresentation,
  MODEL_EXTENSIONS,
  IMAGE_EXTENSIONS
} from 'modules/item/types'
import { EngineType, getModelData } from 'lib/getModelData'
import { computeHashes } from 'modules/deployment/contentUtils'
import ItemDropdown from 'components/ItemDropdown'
import Icon from 'components/Icon'
import { getExtension } from 'lib/file'
import { buildThirdPartyURN, DecodedURN, decodeURN, isThirdParty, URNType } from 'lib/urn'
import { ModelMetrics } from 'modules/models/types'
import {
  getBodyShapeType,
  getMissingBodyShapeType,
  getRarities,
  getWearableCategories,
  getBackgroundStyle,
  isModelPath,
  isImageFile,
  MAX_FILE_SIZE,
  resizeImage,
  isImageCategory,
  getMaxSupplyForRarity
} from 'modules/item/utils'
import ItemImport from 'components/ItemImport'
import { ASSET_MANIFEST } from 'components/AssetImporter/utils'
import { FileTooBigError, WrongExtensionError, InvalidFilesError, MissingModelFileError } from 'modules/item/errors'
import { getThumbnailType, validateEnum, validatePath } from './utils'
import {
  Props,
  State,
  CreateItemView,
  CreateSingleItemModalMetadata,
  StateData,
  SortedContent,
  ItemAssetJson
} from './CreateSingleItemModal.types'
import './CreateSingleItemModal.css'

export default class CreateSingleItemModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()
  thumbnailInput = React.createRef<HTMLInputElement>()

  getInitialState() {
    const { metadata } = this.props

    const state: State = { view: CreateItemView.IMPORT }
    if (!metadata) {
      return state
    }

    const { collectionId, item, addRepresentation } = metadata as CreateSingleItemModalMetadata
    state.collectionId = collectionId

    if (item) {
      state.id = item.id
      state.name = item.name
      state.description = item.description
      state.item = item
      state.collectionId = item.collectionId
      state.bodyShape = getBodyShapeType(item)
      state.category = item.data.category
      state.rarity = item.rarity
      state.isRepresentation = false

      if (addRepresentation) {
        const missingBodyShape = getMissingBodyShapeType(item)
        if (missingBodyShape) {
          state.bodyShape = missingBodyShape
          state.isRepresentation = true
        }
      }
    }

    return state
  }

  /**
   * Prefixes the content name by adding the adding the body shape name to it.
   *
   * @param bodyShape - The body shaped used to prefix the content name.
   * @param contentKey - The content key or name to be prefixed.
   */
  prefixContentName(bodyShape: BodyShapeType, contentKey: string): string {
    return `${bodyShape}/${contentKey}`
  }

  /**
   * Creates a new contents record with the names of the contents blobs record prefixed.
   * The names need to be prefixed so they won't collide with other
   * pre-uploaded models. The name of the content is the name of the uploaded file.
   *
   * @param bodyShape - The body shaped used to prefix the content names.
   * @param contents - The contents which keys are going to be prefixed.
   */
  prefixContents(bodyShape: BodyShapeType, contents: Record<string, Blob>): Record<string, Blob> {
    return Object.keys(contents).reduce((newContents: Record<string, Blob>, key: string) => {
      // Do not include the thumbnail in each of the body shapes
      if (key === THUMBNAIL_PATH) {
        return newContents
      }
      newContents[this.prefixContentName(bodyShape, key)] = contents[key]
      return newContents
    }, {})
  }

  /**
   * Sorts the content into "male", "female" and "all" taking into consideration the body shape.
   * All contains the item thumbnail and both male and female representations according to the shape.
   * If the body representation is male, "female" will be an empty object and viceversa.
   *
   * @param bodyShape - The body shaped used to sort the content.
   * @param contents - The contents to be sorted.
   */
  sortContent = (bodyShape: BodyShapeType, contents: Record<string, Blob>): SortedContent => {
    const male =
      bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE ? this.prefixContents(BodyShapeType.MALE, contents) : {}
    const female =
      bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE ? this.prefixContents(BodyShapeType.FEMALE, contents) : {}
    const all = { [THUMBNAIL_PATH]: contents[THUMBNAIL_PATH], ...male, ...female }

    return { male, female, all }
  }

  handleSubmit = async () => {
    const { address, metadata, collection, onSave } = this.props
    const { id } = this.state

    let changeItemFile = false
    let addRepresentation = false
    let pristineItem: Item | null = null

    if (metadata) {
      changeItemFile = metadata.changeItemFile
      addRepresentation = metadata.addRepresentation
      pristineItem = metadata.item
    }

    if (id && this.isValid()) {
      const {
        name,
        description,
        model,
        thumbnail,
        bodyShape,
        contents,
        metrics,
        collectionId,
        isRepresentation,
        item: editedItem,
        category,
        rarity
      } = this.state as StateData

      let item: Item | undefined

      const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection?.urn)
      const blob = dataURLToBlob(thumbnail)
      const hasCustomThumbnail = THUMBNAIL_PATH in contents
      if (blob && !hasCustomThumbnail) {
        contents[THUMBNAIL_PATH] = blob
      }

      const sortedContents = this.sortContent(bodyShape, contents)

      // Add this item as a representation of an existing item
      if ((isRepresentation || addRepresentation) && editedItem) {
        const hashedContents = await computeHashes(bodyShape === BodyShapeType.MALE ? sortedContents.male : sortedContents.female)
        item = {
          ...editedItem,
          data: {
            ...editedItem.data,
            representations: [
              ...editedItem.data.representations,
              // add new representation
              ...this.buildRepresentations(bodyShape, model, sortedContents)
            ],
            replaces: [...editedItem.data.replaces],
            hides: [...editedItem.data.hides],
            tags: [...editedItem.data.tags]
          },
          contents: {
            ...editedItem.contents,
            ...hashedContents
          },
          updatedAt: +new Date()
        }

        // Do not change the thumbnail when adding a new representation
        delete sortedContents.all[THUMBNAIL_PATH]
      } else if (pristineItem && changeItemFile) {
        item = {
          ...(pristineItem as Item),
          data: {
            ...pristineItem.data,
            replaces: [],
            hides: [],
            category
          },
          name,
          metrics,
          contents: await computeHashes(sortedContents.all),
          updatedAt: +new Date()
        }

        const wearableBodyShape = bodyShape === BodyShapeType.MALE ? WearableBodyShape.MALE : WearableBodyShape.FEMALE
        const representationIndex = pristineItem.data.representations.findIndex(
          (representation: WearableRepresentation) => representation.bodyShapes[0] === wearableBodyShape
        )
        const pristineBodyShape = getBodyShapeType(pristineItem)
        const representations = this.buildRepresentations(bodyShape, model, sortedContents)
        if (representations.length === 2 || representationIndex === -1 || pristineBodyShape === BodyShapeType.BOTH) {
          // Unisex or Representation changed
          item.data.representations = representations
        } else {
          // Edited representation
          item.data.representations[representationIndex] = representations[0]
        }
      } else {
        // If it's a third party item, we need to automatically create an URN for it by generating a random uuid different from the id
        let decodedCollectionUrn: DecodedURN<any> | null = collection?.urn ? decodeURN(collection.urn) : null
        let urn: string | undefined
        if (
          decodedCollectionUrn &&
          decodedCollectionUrn.type === URNType.COLLECTIONS_THIRDPARTY &&
          decodedCollectionUrn.thirdPartyCollectionId
        ) {
          urn = buildThirdPartyURN(decodedCollectionUrn.thirdPartyName, decodedCollectionUrn.thirdPartyCollectionId, uuid.v4())
        }

        // create item to save
        item = {
          id,
          name,
          urn,
          description: description || '',
          thumbnail: THUMBNAIL_PATH,
          type: ItemType.WEARABLE,
          collectionId,
          totalSupply: 0,
          isPublished: false,
          isApproved: false,
          inCatalyst: false,
          contentHash: null,
          rarity: belongsToAThirdPartyCollection ? ItemRarity.UNIQUE : rarity,
          data: {
            category,
            replaces: [],
            hides: [],
            tags: [],
            representations: [...this.buildRepresentations(bodyShape, model, sortedContents)]
          },
          owner: address!,
          metrics,
          contents: await computeHashes(sortedContents.all),
          createdAt: +new Date(),
          updatedAt: +new Date()
        }
      }

      onSave(item, sortedContents.all)
    }
  }

  /**
   * Unzip files and processes the model files.
   * One of the models will be taken into consideration if multiple models are uploaded.
   *
   * @param file - The ZIP file.
   */
  handleZippedModelFiles = async (file: File) => {
    const zip: JSZip = await JSZip.loadAsync(file)
    const fileNames: string[] = []

    zip.forEach(fileName => {
      if (!basename(fileName).startsWith('.')) {
        fileNames.push(fileName)
      }
    })

    // asset.json contains data to populate parts of the state
    const assetJsonPath = fileNames.find(path => basename(path) === ASSET_MANIFEST)
    let assetJson: ItemAssetJson | undefined

    if (assetJsonPath) {
      const assetRaw = zip.file(assetJsonPath)
      const content = await assetRaw.async('text')
      assetJson = JSON.parse(content)
    }

    const modelPath = fileNames.find(isModelPath)

    const files = await Promise.all(
      fileNames
        .map(fileName => zip.file(fileName))
        .filter(file => !!file)
        .map(async file => {
          const blob = await file.async('blob')

          if (blob.size > MAX_FILE_SIZE) {
            throw new FileTooBigError()
          }

          return {
            name: file.name,
            blob
          }
        })
    )

    const contents = files.reduce<Record<string, Blob>>((contents, file) => {
      contents[file.name] = file.blob
      return contents
    }, {})

    if (!modelPath) {
      throw new MissingModelFileError()
    }

    const result = await this.processModel(modelPath, contents)

    return [...result, assetJson] as const
  }

  /**
   * Processes a model file.
   *
   * @param file - The model file.
   */
  handleModelFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new FileTooBigError()
    }

    const modelPath = file.name
    const contents = {
      [modelPath]: file
    }

    return this.processModel(modelPath, contents)
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { metadata } = this.props
    const { isRepresentation, category } = this.state

    let changeItemFile = false
    let item = null

    if (metadata) {
      changeItemFile = metadata.changeItemFile
      item = metadata.item
    }

    const file = acceptedFiles[0]
    const extension = getExtension(file.name)

    try {
      this.setState({ isLoading: true })

      if (!extension) {
        throw new WrongExtensionError()
      }

      const handler = extension === '.zip' ? this.handleZippedModelFiles : this.handleModelFile
      const [thumbnail, model, metrics, contents, assetJson] = await handler(file)

      this.setState({
        id: changeItemFile ? item!.id : uuid.v4(),
        view: CreateItemView.DETAILS,
        name: changeItemFile ? item!.name : cleanAssetName(file.name),
        thumbnail,
        model,
        metrics,
        contents,
        error: '',
        category: isRepresentation ? category : undefined,
        isLoading: false,
        ...(await this.getAssetJsonProps(assetJson, contents))
      })
    } catch (error) {
      this.setState({ error: error.message, isLoading: false })
    }
  }

  async getAssetJsonProps(assetJson: ItemAssetJson = {}, contents: Record<string, Blob> = {}): Promise<ItemAssetJson> {
    const { thumbnail, ...props } = assetJson

    // sanizite
    validatePath('thumbnail', assetJson, contents)
    validatePath('model', assetJson, contents)
    validateEnum('rarity', assetJson, Object.values(ItemRarity))
    validateEnum('category', assetJson, Object.values(WearableCategory))
    validateEnum('bodyShape', assetJson, Object.values(BodyShapeType))

    if (thumbnail && thumbnail in contents) {
      return {
        ...props,
        thumbnail: await blobToDataURL(contents[thumbnail])
      }
    }

    return props
  }

  handleDropRejected = async (rejectedFiles: File[]) => {
    console.warn('rejected', rejectedFiles)
    const error = new InvalidFilesError()
    this.setState({ error: error.message })
  }

  handleOpenDocs = () => window.open('https://docs.decentraland.org/3d-modeling/3d-models/', '_blank')

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) =>
    this.setState({ name: props.value.slice(0, ITEM_NAME_MAX_LENGTH) })

  handleItemChange = (item: Item) => {
    this.setState({ item: item, category: item.data.category, rarity: item.rarity })
  }

  handleCategoryChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const category = value as WearableCategory
    if (this.state.category !== category) {
      this.updateThumbnailByCategory(category)
      this.setState({ category })
    }
  }

  handleRarityChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const rarity = value as ItemRarity
    this.setState({ rarity })
  }

  handleOpenThumbnailDialog = () => {
    if (this.thumbnailInput.current) {
      this.thumbnailInput.current.click()
    }
  }

  handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { contents } = this.state
    const { files } = event.target

    if (files && files.length > 0) {
      const file = files[0]
      const resizedFile = await resizeImage(file)
      const thumbnail = URL.createObjectURL(resizedFile)

      this.setState({
        thumbnail,
        contents: {
          ...contents,
          [THUMBNAIL_PATH]: file
        }
      })
    }
  }

  handleYes = () => this.setState({ isRepresentation: true })

  handleNo = () => this.setState({ isRepresentation: false })

  isAddingRepresentation = () => {
    const { metadata } = this.props
    return !!(metadata && metadata.item && !metadata.changeItemFile)
  }

  filterItemsByBodyShape = (item: Item) => {
    const { bodyShape } = this.state
    const { metadata } = this.props
    return getMissingBodyShapeType(item) === bodyShape && metadata.collectionId === item.collectionId
  }

  async processModel(model: string, contents: Record<string, Blob>): Promise<[string, string, ModelMetrics, Record<string, Blob>]> {
    let thumbnail: string = ''
    let metrics: ModelMetrics

    if (isImageFile(model)) {
      metrics = {
        triangles: 100,
        materials: 1,
        textures: 1,
        meshes: 1,
        bodies: 1,
        entities: 1
      }

      thumbnail = await this.convertImageIntoWearableThumbnail(contents[THUMBNAIL_PATH] || contents[model], this.state.category)
    } else {
      const url = URL.createObjectURL(contents[model])
      const { image, info } = await getModelData(url, {
        width: 512,
        height: 512,
        extension: getExtension(model) || undefined,
        engine: EngineType.BABYLON
      })
      URL.revokeObjectURL(url)

      // for some reason the renderer reports 2x the amount of textures for wearble items
      info.textures = Math.round(info.textures / 2)

      thumbnail = image
      metrics = info
    }

    return [thumbnail, model, metrics, contents]
  }

  /**
   * Updates the item's thumbnail if the user changes the category of the item.
   *
   * @param category - The category of the wearable.
   */
  async updateThumbnailByCategory(category: WearableCategory) {
    const { model, contents } = this.state

    const isCustom = !!contents && THUMBNAIL_PATH in contents
    if (!isCustom) {
      let thumbnail
      if (contents && isImageFile(model!)) {
        thumbnail = await this.convertImageIntoWearableThumbnail(contents[THUMBNAIL_PATH] || contents[model!], category)
      } else {
        const url = URL.createObjectURL(contents![model!])
        const { image } = await getModelData(url, {
          width: 512,
          height: 512,
          thumbnailType: getThumbnailType(category),
          extension: (model && getExtension(model)) || undefined,
          engine: EngineType.BABYLON
        })
        thumbnail = image
        URL.revokeObjectURL(url)
      }
      this.setState({ thumbnail })
    }
  }

  /**
   * Converts an image blob of a wearable into a fixed 512x512 image encoded as data url.
   * This function also adds some padding according to the category of the wearable.
   *
   * @param blob - The blob of the image.
   * @param category - The category of the wearable.
   */
  async convertImageIntoWearableThumbnail(blob: Blob, category: WearableCategory = WearableCategory.EYES) {
    // load blob into image
    const image = new Image()
    const loadFuture = future()
    image.onload = loadFuture.resolve
    image.src = await blobToDataURL(blob)
    await loadFuture

    let padding = 128
    switch (category) {
      case WearableCategory.EYEBROWS:
        padding = 160
        break
      case WearableCategory.MOUTH:
        padding = 160
        break
      case WearableCategory.EYES:
        padding = 128
        break
    }

    // render image into canvas, with a padding from the top. This is to center the textures into the square thumbnail.
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    canvas.style.visibility = 'hidden'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, padding, canvas.width, canvas.height)

    // remove canvas
    document.body.removeChild(canvas)

    // return image
    return canvas.toDataURL()
  }

  buildRepresentations(bodyShape: BodyShapeType, model: string, contents: SortedContent): WearableRepresentation[] {
    const representations: WearableRepresentation[] = []

    // add male representation
    if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.BOTH) {
      representations.push({
        bodyShapes: [WearableBodyShape.MALE],
        mainFile: this.prefixContentName(BodyShapeType.MALE, model),
        contents: Object.keys(contents.male),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    // add female representation
    if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.BOTH) {
      representations.push({
        bodyShapes: [WearableBodyShape.FEMALE],
        mainFile: this.prefixContentName(BodyShapeType.FEMALE, model),
        contents: Object.keys(contents.female),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    return representations
  }

  renderModalTitle = () => {
    const isAddingRepresentation = this.isAddingRepresentation()
    const { bodyShape } = this.state
    const { metadata } = this.props
    if (isAddingRepresentation) {
      return t('create_single_item_modal.add_representation', { bodyShape: t(`body_shapes.${bodyShape}`) })
    }

    if (metadata && metadata.changeItemFile) {
      return t('create_single_item_modal.change_item_file')
    }

    return t('create_single_item_modal.title')
  }

  renderImportView() {
    const { onClose, metadata } = this.props
    const { changeItemFile } = metadata as CreateSingleItemModalMetadata
    const { isRepresentation, category, error } = this.state
    const title = this.renderModalTitle()

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <ItemImport
            error={error}
            acceptedExtensions={
              isRepresentation || changeItemFile ? (isImageCategory(category!) ? IMAGE_EXTENSIONS : MODEL_EXTENSIONS) : ITEM_EXTENSIONS
            }
            onDropAccepted={this.handleDropAccepted}
            onDropRejected={this.handleDropRejected}
          />
        </Modal.Content>
      </>
    )
  }

  renderFields() {
    const { collection } = this.props
    const { name, category, rarity, contents, item } = this.state

    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const rarities = getRarities()
    const categories = getWearableCategories(contents)

    return (
      <>
        <Field className="name" label={t('create_single_item_modal.name_label')} value={name} onChange={this.handleNameChange} />
        {(!item || !item.isPublished) && !belongsToAThirdPartyCollection ? (
          <SelectField
            label={t('create_single_item_modal.rarity_label')}
            placeholder={t('create_single_item_modal.rarity_placeholder')}
            value={rarity}
            options={rarities.map(value => ({
              value,
              label: t(`wearable.supply`, {
                count: getMaxSupplyForRarity(value),
                formatted: getMaxSupplyForRarity(value).toLocaleString()
              }),
              text: t(`wearable.rarity.${value}`)
            }))}
            onChange={this.handleRarityChange}
          />
        ) : null}
        <SelectField
          required
          label={t('create_single_item_modal.category_label')}
          placeholder={t('create_single_item_modal.category_placeholder')}
          value={categories.includes(category!) ? category : undefined}
          options={categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))}
          onChange={this.handleCategoryChange}
        />
      </>
    )
  }

  isDisabled(): boolean {
    const { isLoading } = this.props

    return !this.isValid() || isLoading
  }

  isValid(): boolean {
    const { name, thumbnail, metrics, bodyShape, category, rarity, item, isRepresentation } = this.state
    const { collection } = this.props
    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)

    let required: (string | ModelMetrics | Item | undefined)[]

    if (isRepresentation) {
      required = [item]
    } else if (belongsToAThirdPartyCollection) {
      required = [name, thumbnail, metrics, bodyShape, category]
    } else {
      required = [name, thumbnail, metrics, bodyShape, category, rarity]
    }

    return required.every(prop => prop !== undefined)
  }

  renderDetailsView() {
    const { onClose, metadata, error, isLoading } = this.props
    const { thumbnail, metrics, bodyShape, isRepresentation, item, rarity } = this.state

    const isDisabled = this.isDisabled()
    const isAddingRepresentation = this.isAddingRepresentation()
    const thumbnailStyle = getBackgroundStyle(rarity)
    const title = this.renderModalTitle()

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <Form onSubmit={this.handleSubmit} disabled={isDisabled}>
            <Column>
              <Row className="details">
                <Column className="preview" width={192} grow={false}>
                  <div className="thumbnail-container">
                    <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} />
                    {isRepresentation ? null : (
                      <>
                        <Icon name="camera" onClick={this.handleOpenThumbnailDialog} />
                        <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnailChange} accept="image/png, image/jpeg" />
                      </>
                    )}
                  </div>
                  {metrics ? (
                    <div className="metrics">
                      <div className="metric triangles">{t('model_metrics.triangles', { count: metrics.triangles })}</div>
                      <div className="metric materials">{t('model_metrics.materials', { count: metrics.materials })}</div>
                      <div className="metric textures">{t('model_metrics.textures', { count: metrics.textures })}</div>
                    </div>
                  ) : null}
                </Column>
                <Column className="data" grow={true}>
                  {isAddingRepresentation ? null : (
                    <Section>
                      <Header sub>{t('create_single_item_modal.representation_label')}</Header>
                      <Row>
                        {this.renderRepresentation(BodyShapeType.BOTH)}
                        {this.renderRepresentation(BodyShapeType.MALE)}
                        {this.renderRepresentation(BodyShapeType.FEMALE)}
                      </Row>
                    </Section>
                  )}
                  {bodyShape && (!metadata || !metadata.changeItemFile) ? (
                    <>
                      {bodyShape === BodyShapeType.BOTH ? (
                        this.renderFields()
                      ) : (
                        <>
                          {isAddingRepresentation ? null : (
                            <Section>
                              <Header sub>{t('create_single_item_modal.existing_item')}</Header>
                              <Row>
                                <div className={`option ${isRepresentation === true ? 'active' : ''}`} onClick={this.handleYes}>
                                  {t('global.yes')}
                                </div>
                                <div className={`option ${isRepresentation === false ? 'active' : ''}`} onClick={this.handleNo}>
                                  {t('global.no')}
                                </div>
                              </Row>
                            </Section>
                          )}
                          {isRepresentation === undefined ? null : isRepresentation ? (
                            <Section>
                              <Header sub>
                                {isAddingRepresentation
                                  ? t('create_single_item_modal.adding_representation', { bodyShape: t(`body_shapes.${bodyShape}`) })
                                  : t('create_single_item_modal.pick_item', { bodyShape: t(`body_shapes.${bodyShape}`) })}
                              </Header>
                              <ItemDropdown
                                value={item}
                                filter={this.filterItemsByBodyShape}
                                onChange={this.handleItemChange}
                                isDisabled={isAddingRepresentation}
                              />
                            </Section>
                          ) : (
                            this.renderFields()
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    this.renderFields()
                  )}
                </Column>
              </Row>
              <Row className="actions" align="right">
                <Button primary disabled={isDisabled} loading={isLoading}>
                  {(metadata && metadata.changeItemFile) || isRepresentation ? t('global.save') : t('global.create')}
                </Button>
              </Row>
              {error ? (
                <Row className="error" align="right">
                  <p className="danger-text">{error}</p>
                </Row>
              ) : null}
            </Column>
          </Form>
        </Modal.Content>
      </>
    )
  }

  renderRepresentation(type: BodyShapeType) {
    const { bodyShape } = this.state
    const { metadata } = this.props
    return (
      <div
        className={`option has-icon ${type} ${type === bodyShape ? 'active' : ''}`.trim()}
        onClick={() =>
          this.setState({ bodyShape: type, isRepresentation: metadata && metadata.changeItemFile ? false : undefined, item: undefined })
        }
      >
        {t('body_shapes.' + type)}
      </div>
    )
  }

  renderView() {
    switch (this.state.view) {
      case CreateItemView.IMPORT:
        return this.renderImportView()
      case CreateItemView.DETAILS:
        return this.renderDetailsView()
      default:
        return null
    }
  }

  render() {
    const { name, onClose } = this.props
    return (
      <Modal name={name} onClose={onClose}>
        {this.renderView()}
      </Modal>
    )
  }
}
