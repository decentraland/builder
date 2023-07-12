import * as React from 'react'
import uuid from 'uuid'
import { BodyShape, EmoteCategory, EmoteDataADR74, PreviewProjection, WearableCategory } from '@dcl/schemas'
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
  DropdownProps,
  WearablePreview,
  Message
} from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getImageType, dataURLToBlob, convertImageIntoWearableThumbnail } from 'modules/media/utils'
import { ImageType } from 'modules/media/types'
import {
  THUMBNAIL_PATH,
  Item,
  BodyShapeType,
  ItemRarity,
  ITEM_NAME_MAX_LENGTH,
  WearableRepresentation,
  ItemType,
  EmotePlayMode,
  WearableData
} from 'modules/item/types'
import { EngineType, getItemData, getModelData } from 'lib/getModelData'
import { computeHashes } from 'modules/deployment/contentUtils'
import ItemDropdown from 'components/ItemDropdown'
import Icon from 'components/Icon'
import { getExtension } from 'lib/file'
import { buildThirdPartyURN, DecodedURN, decodeURN, isThirdParty, URNType } from 'lib/urn'
import { areEmoteMetrics, Metrics } from 'modules/models/types'
import {
  getBodyShapeType,
  getMissingBodyShapeType,
  getRarities,
  getWearableCategories,
  getBackgroundStyle,
  isImageFile,
  resizeImage,
  getMaxSupplyForRarity,
  getEmoteCategories,
  getEmotePlayModes,
  getBodyShapeTypeFromContents
} from 'modules/item/utils'
import ImportStep from './ImportStep/ImportStep'
import EditThumbnailStep from './EditThumbnailStep/EditThumbnailStep'
import { getThumbnailType, toEmoteWithBlobs, toWearableWithBlobs } from './utils'
import EditPriceAndBeneficiaryModal from '../EditPriceAndBeneficiaryModal'
import {
  Props,
  State,
  CreateItemView,
  CreateSingleItemModalMetadata,
  StateData,
  SortedContent,
  AcceptedFileProps
} from './CreateSingleItemModal.types'
import './CreateSingleItemModal.css'

export default class CreateSingleItemModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()
  thumbnailInput = React.createRef<HTMLInputElement>()
  modalContainer = React.createRef<HTMLDivElement>()

  getInitialState() {
    const { metadata } = this.props

    const state: State = {
      view: CreateItemView.IMPORT,
      playMode: EmotePlayMode.SIMPLE,
      weareblePreviewUpdated: false,
      hasScreenshotTaken: false
    }
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
      state.type = item.type
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

  sortContentZipBothBodyShape = (bodyShape: BodyShapeType, contents: Record<string, Blob>): SortedContent => {
    const male: Record<string, Blob> = {},
      female: Record<string, Blob> = {}
    for (const key in contents) {
      if (key.startsWith('male/') && (bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE)) {
        male[key] = contents[key]
      } else if (key.startsWith('female/') && (bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE)) {
        female[key] = contents[key]
      }
    }
    const all = { [THUMBNAIL_PATH]: contents[THUMBNAIL_PATH], ...male, ...female }
    return { male, female, all }
  }

  createItem = async (sortedContents: SortedContent, representations: WearableRepresentation[]) => {
    const { address, collection, onSave } = this.props
    const { id, name, description, type, metrics, collectionId, category, playMode, rarity, hasScreenshotTaken, requiredPermissions } = this
      .state as StateData

    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection?.urn)
    // If it's a third party item, we need to automatically create an URN for it by generating a random uuid different from the id
    const decodedCollectionUrn: DecodedURN<any> | null = collection?.urn ? decodeURN(collection.urn) : null
    let urn: string | undefined
    if (
      decodedCollectionUrn &&
      decodedCollectionUrn.type === URNType.COLLECTIONS_THIRDPARTY &&
      decodedCollectionUrn.thirdPartyCollectionId
    ) {
      urn = buildThirdPartyURN(decodedCollectionUrn.thirdPartyName, decodedCollectionUrn.thirdPartyCollectionId, uuid.v4())
    }

    // create item to save
    let data: WearableData | EmoteDataADR74

    if (type === ItemType.WEARABLE) {
      data = {
        category: category as WearableCategory,
        replaces: [],
        hides: [],
        tags: [],
        representations: [...representations],
        requiredPermissions: requiredPermissions || []
      } as WearableData
    } else {
      data = {
        category: category as EmoteCategory,
        loop: playMode === EmotePlayMode.LOOP,
        tags: [],
        representations: [...representations]
      } as EmoteDataADR74
    }

    const item = {
      id,
      name,
      urn,
      description: description || '',
      thumbnail: THUMBNAIL_PATH,
      type,
      collectionId,
      totalSupply: 0,
      isPublished: false,
      isApproved: false,
      inCatalyst: false,
      blockchainContentHash: null,
      currentContentHash: null,
      catalystContentHash: null,
      rarity: belongsToAThirdPartyCollection ? ItemRarity.UNIQUE : rarity,
      data,
      owner: address!,
      metrics,
      contents: await computeHashes(sortedContents.all),
      createdAt: +new Date(),
      updatedAt: +new Date()
    }

    // The Emote will be saved on the set price step
    if (type === ItemType.EMOTE) {
      this.setState({
        item: { ...(item as Item) },
        itemSortedContents: sortedContents.all,
        view: hasScreenshotTaken ? CreateItemView.SET_PRICE : CreateItemView.THUMBNAIL,
        fromView: CreateItemView.THUMBNAIL
      })
    } else {
      onSave(item as Item, sortedContents.all)
    }
  }

  addItemRepresentation = async (sortedContents: SortedContent, representations: WearableRepresentation[]) => {
    const { onSave } = this.props
    const { bodyShape, item: editedItem, requiredPermissions } = this.state as StateData
    const hashedContents = await computeHashes(bodyShape === BodyShapeType.MALE ? sortedContents.male : sortedContents.female)
    const item = {
      ...editedItem,
      data: {
        ...editedItem.data,
        representations: [
          ...editedItem.data.representations,
          // add new representation
          ...representations
        ],
        replaces: [...editedItem.data.replaces],
        hides: [...editedItem.data.hides],
        tags: [...editedItem.data.tags],
        requiredPermissions: requiredPermissions || []
      },
      contents: {
        ...editedItem.contents,
        ...hashedContents
      },
      updatedAt: +new Date()
    }

    // Do not change the thumbnail when adding a new representation
    delete sortedContents.all[THUMBNAIL_PATH]
    onSave(item, sortedContents.all)
  }

  modifyItem = async (pristineItem: Item, sortedContents: SortedContent, representations: WearableRepresentation[]) => {
    const { onSave } = this.props
    const { name, bodyShape, type, metrics, category, playMode, requiredPermissions } = this.state as StateData

    let data: WearableData | EmoteDataADR74

    if (type === ItemType.WEARABLE) {
      data = {
        ...pristineItem.data,
        replaces: [],
        hides: [],
        category: category as WearableCategory,
        requiredPermissions: requiredPermissions || []
      } as WearableData
    } else {
      data = {
        ...pristineItem.data,
        loop: playMode === EmotePlayMode.LOOP,
        category: category as EmoteCategory
      } as EmoteDataADR74
    }

    const item = {
      ...pristineItem,
      data,
      name,
      metrics,
      contents: await computeHashes(sortedContents.all),
      updatedAt: +new Date()
    }

    const wearableBodyShape = bodyShape === BodyShapeType.MALE ? BodyShape.MALE : BodyShape.FEMALE
    const representationIndex = pristineItem.data.representations.findIndex(
      (representation: WearableRepresentation) => representation.bodyShapes[0] === wearableBodyShape
    )
    const pristineBodyShape = getBodyShapeType(pristineItem)
    if (representations.length === 2 || representationIndex === -1 || pristineBodyShape === BodyShapeType.BOTH) {
      // Unisex or Representation changed
      item.data.representations = representations
    } else {
      // Edited representation
      item.data.representations[representationIndex] = representations[0]
    }

    onSave(item as Item, sortedContents.all)
  }

  handleSubmit = async () => {
    const { metadata, onSave } = this.props
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
      const { thumbnail, contents, bodyShape, type, model, isRepresentation, item: editedItem } = this.state as StateData

      if (this.state.view === CreateItemView.DETAILS) {
        try {
          const blob = dataURLToBlob(thumbnail)
          const hasCustomThumbnail = THUMBNAIL_PATH in contents
          if (blob && !hasCustomThumbnail) {
            contents[THUMBNAIL_PATH] = blob
          }

          const sortedContents =
            type === ItemType.WEARABLE && getBodyShapeTypeFromContents(contents) === BodyShapeType.BOTH
              ? this.sortContentZipBothBodyShape(bodyShape, contents)
              : this.sortContent(bodyShape, contents)
          const representations =
            type === ItemType.WEARABLE && getBodyShapeTypeFromContents(contents) === BodyShapeType.BOTH
              ? this.buildRepresentationsZipBothBodyshape(bodyShape, sortedContents)
              : this.buildRepresentations(bodyShape, model, sortedContents)

          // Add this item as a representation of an existing item
          if ((isRepresentation || addRepresentation) && editedItem) {
            await this.addItemRepresentation(sortedContents, representations)
          } else if (pristineItem && changeItemFile) {
            await this.modifyItem(pristineItem, sortedContents, representations)
          } else {
            await this.createItem(sortedContents, representations)
          }
        } catch (error) {
          this.setState({ error: error.message })
        }
      } else if (this.state.view === CreateItemView.SET_PRICE && !!this.state.item && !!this.state.itemSortedContents) {
        onSave(this.state.item, this.state.itemSortedContents)
      }
    }
  }

  getMetricsAndScreenshot = async () => {
    const { type, previewController, model, contents, category } = this.state
    if (type && model && contents) {
      const data = await getItemData({
        wearablePreviewController: previewController,
        type,
        model,
        contents,
        category
      })
      this.setState({ metrics: data.info, thumbnail: data.image, isLoading: false }, () => {
        this.setState({ view: CreateItemView.DETAILS })
      })
    }
  }

  handleDropAccepted = (acceptedFileProps: AcceptedFileProps) => {
    const { bodyShape, ...acceptedProps } = acceptedFileProps
    this.setState(prevState => ({
      isLoading: true,
      bodyShape: bodyShape || prevState.bodyShape,
      ...acceptedProps
    }))
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
      this.setState({ category })
      if (this.state.type === ItemType.WEARABLE) {
        // As it's not required to wait for the promise, use the void operator to return undefined
        void this.updateThumbnailByCategory(category)
      }
    }
  }

  handleRarityChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const rarity = value as ItemRarity
    this.setState({ rarity })
  }

  handlePlayModeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const playMode = value as EmotePlayMode
    this.setState({ playMode })
  }

  handleOpenThumbnailDialog = () => {
    const { type } = this.state
    if (type === ItemType.EMOTE) {
      this.setState({ fromView: CreateItemView.DETAILS, view: CreateItemView.THUMBNAIL })
    } else if (this.thumbnailInput.current) {
      this.thumbnailInput.current.click()
    }
  }

  handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { contents } = this.state
    const { files } = event.target

    if (files && files.length > 0) {
      const file = files[0]
      const imageType = await getImageType(file)
      if (imageType !== ImageType.PNG) {
        this.setState({ error: t('create_single_item_modal.wrong_thumbnail_format') })
        return
      }
      this.setState({ error: undefined })

      const smallThumbnailBlob = await resizeImage(file)
      const bigThumbnailBlob = await resizeImage(file, 1024, 1024)

      const thumbnail = URL.createObjectURL(smallThumbnailBlob)

      this.setState({
        thumbnail,
        contents: {
          ...contents,
          [THUMBNAIL_PATH]: bigThumbnailBlob
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
        thumbnail = await convertImageIntoWearableThumbnail(contents[THUMBNAIL_PATH] || contents[model!], category)
      } else {
        const url = URL.createObjectURL(contents![model!])
        const { image } = await getModelData(url, {
          width: 1024,
          height: 1024,
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

  buildRepresentations(bodyShape: BodyShapeType, model: string, contents: SortedContent): WearableRepresentation[] {
    const representations: WearableRepresentation[] = []

    // add male representation
    if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.BOTH) {
      representations.push({
        bodyShapes: [BodyShape.MALE],
        mainFile: this.prefixContentName(BodyShapeType.MALE, model),
        contents: Object.keys(contents.male),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    // add female representation
    if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.BOTH) {
      representations.push({
        bodyShapes: [BodyShape.FEMALE],
        mainFile: this.prefixContentName(BodyShapeType.FEMALE, model),
        contents: Object.keys(contents.female),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    return representations
  }

  buildRepresentationsZipBothBodyshape(bodyShape: BodyShapeType, contents: SortedContent): WearableRepresentation[] {
    const representations: WearableRepresentation[] = []

    // add male representation
    if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.BOTH) {
      representations.push({
        bodyShapes: [BodyShape.MALE],
        mainFile: Object.keys(contents.male).pop()!,
        contents: Object.keys(contents.male),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    // add female representation
    if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.BOTH) {
      representations.push({
        bodyShapes: [BodyShape.FEMALE],
        mainFile: Object.keys(contents.female).pop()!,
        contents: Object.keys(contents.female),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    return representations
  }

  renderModalTitle = () => {
    const isAddingRepresentation = this.isAddingRepresentation()
    const { bodyShape, type, view } = this.state
    const { metadata } = this.props
    if (isAddingRepresentation) {
      return t('create_single_item_modal.add_representation', { bodyShape: t(`body_shapes.${bodyShape!}`) })
    }

    if (metadata && metadata.changeItemFile) {
      return t('create_single_item_modal.change_item_file')
    }

    if (type === ItemType.EMOTE) {
      return view === CreateItemView.THUMBNAIL
        ? t('create_single_item_modal.thumbnail_step_title')
        : t('create_single_item_modal.title_emote')
    }

    return view === CreateItemView.THUMBNAIL ? t('create_single_item_modal.thumbnail_step_title') : t('create_single_item_modal.title')
  }

  handleFileLoad = async () => {
    const { weareblePreviewUpdated, type, model } = this.state
    // if model is an image, the wearable preview won't be needed
    if (model && isImageFile(model)) {
      return this.getMetricsAndScreenshot()
    }

    const controller = WearablePreview.createController('thumbnail-picker')
    this.setState({ previewController: controller })

    if (weareblePreviewUpdated) {
      if (type === ItemType.EMOTE) {
        const length = await controller.emote.getLength()
        await controller.emote.goTo(Math.floor(Math.random() * length))
      }
      return this.getMetricsAndScreenshot()
    }
  }

  renderWearablePreview = () => {
    const { type, contents } = this.state
    const isEmote = type === ItemType.EMOTE
    const blob = contents ? (isEmote ? toEmoteWithBlobs({ contents }) : toWearableWithBlobs({ contents })) : undefined
    if (!blob) {
      return null
    }
    const wearablePreviewExtraOptions = isEmote
      ? {
          profile: 'default',
          disableFace: true,
          disableDefaultWearables: true,
          skin: '000000',
          wheelZoom: 2
        }
      : {}

    return (
      <WearablePreview
        id="thumbnail-picker"
        blob={blob}
        disableBackground
        disableAutoRotate
        projection={PreviewProjection.ORTHOGRAPHIC}
        {...wearablePreviewExtraOptions}
        onUpdate={() => this.setState({ weareblePreviewUpdated: true })}
        onLoad={this.handleFileLoad}
      />
    )
  }

  renderImportView() {
    const { metadata, onClose } = this.props
    const { category, isLoading, isRepresentation } = this.state
    const title = this.renderModalTitle()

    return (
      <ImportStep
        category={category as WearableCategory | EmoteCategory}
        metadata={metadata}
        title={title}
        wearablePreviewComponent={<div className="importer-thumbnail-container">{this.renderWearablePreview()}</div>}
        isLoading={!!isLoading}
        isRepresentation={!!isRepresentation}
        onDropAccepted={this.handleDropAccepted}
        onClose={onClose}
      />
    )
  }

  renderFields() {
    const { collection } = this.props
    const { name, category, rarity, contents, item, type } = this.state

    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const rarities = getRarities()
    const categories: string[] = type === ItemType.WEARABLE ? getWearableCategories(contents) : getEmoteCategories()

    const raritiesLink =
      type === ItemType.EMOTE
        ? 'https://docs.decentraland.org/emotes/emotes/#rarity'
        : 'https://docs.decentraland.org/decentraland/wearables-editor-user-guide/#rarity'

    return (
      <>
        <Field className="name" label={t('create_single_item_modal.name_label')} value={name} onChange={this.handleNameChange} />
        {(!item || !item.isPublished) && !belongsToAThirdPartyCollection ? (
          <>
            <SelectField
              label={t('create_single_item_modal.rarity_label')}
              placeholder={t('create_single_item_modal.rarity_placeholder')}
              value={rarity}
              options={rarities.map(value => ({
                value,
                label: t('wearable.supply', {
                  count: getMaxSupplyForRarity(value),
                  formatted: getMaxSupplyForRarity(value).toLocaleString()
                }),
                text: t(`wearable.rarity.${value}`)
              }))}
              onChange={this.handleRarityChange}
            />
            <p className="rarity learn-more">
              <T
                id="create_single_item_modal.rarity_learn_more_about"
                values={{
                  learn_more: (
                    <a href={raritiesLink} target="_blank" rel="noopener noreferrer">
                      {t('global.learn_more')}
                    </a>
                  )
                }}
              />
            </p>
          </>
        ) : null}
        <SelectField
          required
          label={t('create_single_item_modal.category_label')}
          placeholder={t('create_single_item_modal.category_placeholder')}
          value={categories.includes(category!) ? category : undefined}
          options={categories.map(value => ({ value, text: t(`${type!}.category.${value}`) }))}
          onChange={this.handleCategoryChange}
        />
      </>
    )
  }

  renderWearableDetails() {
    const { metadata } = this.props
    const { bodyShape, isRepresentation, item } = this.state
    const isAddingRepresentation = this.isAddingRepresentation()

    return (
      <>
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
      </>
    )
  }

  getPlayModeOptions() {
    const playModes: string[] = getEmotePlayModes()

    return playModes.map(value => ({
      value,
      text: t(`emote.play_mode.${value}.text`),
      description: t(`emote.play_mode.${value}.description`)
    }))
  }

  renderEmoteDetails() {
    const { playMode = '' } = this.state

    return (
      <>
        {this.renderFields()}
        <SelectField
          required
          search={false}
          className="has-description"
          label={t('create_single_item_modal.play_mode_label')}
          placeholder={t('create_single_item_modal.play_mode_placeholder')}
          value={playMode as EmotePlayMode}
          options={this.getPlayModeOptions()}
          onChange={this.handlePlayModeChange}
        />
        <div className="dcl select-field">
          <Message info visible content={t('create_single_item_modal.emote_notice')} icon={<Icon name="alert" className="" />} />
        </div>
      </>
    )
  }

  renderMetrics() {
    const { metrics } = this.state

    if (metrics) {
      if (areEmoteMetrics(metrics)) {
        return (
          <div className="metrics">
            <div className="metric circle">{t('model_metrics.sequences', { count: metrics.sequences })}</div>
            <div className="metric circle">{t('model_metrics.duration', { count: metrics.duration.toFixed(2) })}</div>
            <div className="metric circle">{t('model_metrics.frames', { count: metrics.frames })}</div>
            <div className="metric circle">{t('model_metrics.fps', { count: metrics.fps.toFixed(2) })}</div>
          </div>
        )
      } else {
        return (
          <div className="metrics">
            <div className="metric triangles">{t('model_metrics.triangles', { count: metrics.triangles })}</div>
            <div className="metric materials">{t('model_metrics.materials', { count: metrics.materials })}</div>
            <div className="metric textures">{t('model_metrics.textures', { count: metrics.textures })}</div>
          </div>
        )
      }
    } else {
      return null
    }
  }

  isDisabled(): boolean {
    const { isLoading } = this.props

    return !this.isValid() || isLoading
  }

  isValid(): boolean {
    const { name, thumbnail, metrics, bodyShape, category, playMode, rarity, item, isRepresentation, type } = this.state
    const { collection } = this.props
    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)

    let required: (string | Metrics | Item | undefined)[]

    if (isRepresentation) {
      required = [item]
    } else if (belongsToAThirdPartyCollection) {
      required = [name, thumbnail, metrics, bodyShape, category]
    } else if (type === ItemType.EMOTE) {
      required = [name, thumbnail, metrics, category, playMode, rarity, type]
    } else {
      required = [name, thumbnail, metrics, bodyShape, category, rarity, type]
    }

    return required.every(prop => prop !== undefined)
  }

  renderDetailsView() {
    const { onClose, metadata, error, isLoading } = this.props
    const { thumbnail, isRepresentation, rarity, error: stateError, type } = this.state

    const isDisabled = this.isDisabled()
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
                    <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
                    {isRepresentation ? null : (
                      <>
                        <Icon name="camera" onClick={this.handleOpenThumbnailDialog} />
                        <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnailChange} accept="image/png" />
                      </>
                    )}
                  </div>
                  {this.renderMetrics()}
                </Column>
                <Column className="data" grow={true}>
                  {type === ItemType.WEARABLE ? this.renderWearableDetails() : this.renderEmoteDetails()}
                </Column>
              </Row>
              <Row className="actions" align="right">
                <Button primary disabled={isDisabled} loading={isLoading}>
                  {(metadata && metadata.changeItemFile) || isRepresentation
                    ? t('global.save')
                    : type === ItemType.EMOTE
                    ? t('global.next')
                    : t('global.create')}
                </Button>
              </Row>
              {stateError ? (
                <Row className="error" align="right">
                  <p className="danger-text">{stateError}</p>
                </Row>
              ) : null}
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

  handleOnScreenshotTaken = async (screenshot: string) => {
    const { fromView, itemSortedContents, item } = this.state
    const view = fromView === CreateItemView.DETAILS ? CreateItemView.DETAILS : CreateItemView.SET_PRICE

    if (item && itemSortedContents) {
      const blob = dataURLToBlob(screenshot)

      itemSortedContents[THUMBNAIL_PATH] = blob!
      item.contents = await computeHashes(itemSortedContents)

      this.setState({ itemSortedContents, item, hasScreenshotTaken: true }, () => this.setState({ view }))
    } else {
      this.setState({ thumbnail: screenshot, hasScreenshotTaken: true }, () => this.setState({ view }))
    }
  }

  renderThumbnailView() {
    const { onClose } = this.props
    const { isLoading, contents } = this.state

    return (
      <EditThumbnailStep
        isLoading={!!isLoading}
        blob={contents ? toEmoteWithBlobs({ contents }) : undefined}
        title={this.renderModalTitle()}
        onBack={() => this.setState({ view: CreateItemView.DETAILS })}
        onSave={this.handleOnScreenshotTaken}
        onClose={onClose}
      />
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

  renderSetPrice() {
    const { onClose } = this.props
    const { item, itemSortedContents } = this.state
    return (
      <EditPriceAndBeneficiaryModal
        name={'EditPriceAndBeneficiaryModal'}
        metadata={{ itemId: item!.id }}
        item={item!}
        itemSortedContents={itemSortedContents}
        onClose={onClose}
        mountNode={this.modalContainer.current ?? undefined}
        // If the Set Price step is skipped, the item must be saved
        onSkip={this.handleSubmit}
      />
    )
  }

  renderView() {
    switch (this.state.view) {
      case CreateItemView.IMPORT:
        return this.renderImportView()
      case CreateItemView.DETAILS:
        return this.renderDetailsView()
      case CreateItemView.THUMBNAIL:
        return this.renderThumbnailView()
      case CreateItemView.SET_PRICE:
        return this.renderSetPrice()
      default:
        return null
    }
  }

  render() {
    const { name, onClose } = this.props
    return (
      <div ref={this.modalContainer} className="CreateSingleItemModalContainer">
        <Modal name={name} onClose={onClose} mountNode={this.modalContainer.current ?? undefined}>
          {this.renderView()}
        </Modal>
      </div>
    )
  }
}
