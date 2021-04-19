import * as React from 'react'
import { basename } from 'path'
import uuid from 'uuid'
import JSZip from 'jszip'
import {
  ModalNavigation,
  Loader,
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
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { cleanAssetName } from 'modules/asset/utils'
import { blobToDataURL, dataURLToBlob } from 'modules/media/utils'
import {
  THUMBNAIL_PATH,
  Item,
  ItemType,
  WearableBodyShape,
  BodyShapeType,
  WearableCategory,
  ItemRarity,
  RARITY_COLOR_LIGHT,
  RARITY_COLOR,
  ITEM_NAME_MAX_LENGTH,
  WearableRepresentation
} from 'modules/item/types'
import { getModelData } from 'lib/getModelData'
import { getModelData2 } from 'lib/getModelData2'
import { makeContentFile, calculateBufferHash } from 'modules/deployment/contentUtils'
import FileImport from 'components/FileImport'
import ItemDropdown from 'components/ItemDropdown'
import { getExtension, MAX_FILE_SIZE } from 'lib/file'
import { ModelMetrics } from 'modules/scene/types'
import { getBodyShapeType, getMissingBodyShapeType, getRarities, getCategories, isComplexFile } from 'modules/item/utils'
import { getThumbnailType } from './utils'
import { Props, State, CreateItemView, CreateItemModalMetadata } from './CreateItemModal.types'
import './CreateItemModal.css'

export default class CreateItemModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState() {
    const { metadata } = this.props

    const state: State = { view: CreateItemView.IMPORT }
    if (!metadata) {
      return state
    }

    const { collectionId, item, addRepresentation } = metadata as CreateItemModalMetadata
    state.collectionId = collectionId

    if (item) {
      state.id = item.id
      state.name = item.name
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

  isAddingRepresentation = () => {
    const { metadata } = this.props
    return !!(metadata && metadata.item && !metadata.changeItemFile)
  }

  filterItemsByBodyShape = (item: Item) => {
    const { bodyShape } = this.state
    return getMissingBodyShapeType(item) === bodyShape
  }

  handleSubmit = async () => {
    const { address, metadata, onSave, onSavePublished } = this.props

    const {
      id,
      name,
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
    } = this.state

    let changeItemFile = false
    let addRepresentation = false
    let pristineItem = null

    if (metadata) {
      changeItemFile = metadata.changeItemFile
      addRepresentation = metadata.addRepresentation
      pristineItem = metadata.item
    }

    if (id && name && model && bodyShape && contents && metrics && category && thumbnail) {
      let item: Item | undefined

      const blob = dataURLToBlob(thumbnail)
      const hasCustomThumbnail = THUMBNAIL_PATH in contents
      if (blob && !hasCustomThumbnail) {
        contents[THUMBNAIL_PATH] = blob
      }

      // Add this item as a representation of an existing item
      if (isRepresentation && addRepresentation && editedItem) {
        item = {
          ...editedItem,
          data: {
            ...editedItem.data,
            representations: [...editedItem.data.representations],
            replaces: [...editedItem.data.replaces],
            hides: [...editedItem.data.hides],
            tags: [...editedItem.data.tags]
          },
          contents: {
            ...editedItem.contents
          },
          updatedAt: +new Date()
        }

        // add new representation
        item.data.representations.push({
          bodyShapes: bodyShape === BodyShapeType.MALE ? [WearableBodyShape.MALE] : [WearableBodyShape.FEMALE],
          mainFile: model,
          contents: Object.keys(contents),
          overrideHides: [],
          overrideReplaces: []
        })

        // add new contents
        const newContents = await this.computeHashes(contents!)
        delete newContents[THUMBNAIL_PATH] // we do not override the old thumbnail with the new one from this representation
        for (const path in newContents) {
          item.contents[path] = newContents[path]
        }
      } else if (pristineItem && changeItemFile) {
        item = {
          ...(pristineItem as Item),
          metrics,
          contents: await this.computeHashes(contents!),
          updatedAt: +new Date()
        }

        const wearableBodyShape = bodyShape === BodyShapeType.MALE ? WearableBodyShape.MALE : WearableBodyShape.FEMALE
        const representationIndex = pristineItem.data.representations.findIndex(
          (representation: WearableRepresentation) => representation.bodyShapes[0] === wearableBodyShape
        )
        const pristineBodyShape = getBodyShapeType(pristineItem)
        const representations = this.getBodyShapes(bodyShape, model, contents)
        if (representations.length === 2 || representationIndex === -1 || pristineBodyShape === BodyShapeType.UNISEX) {
          // Unisex or Representation changed
          item.data.representations = representations
        } else {
          // Edited representation
          item.data.representations[representationIndex] = representations[0]
        }

        // add new contents
        const newContents = await this.computeHashes(contents!)
        delete newContents[THUMBNAIL_PATH] // we do not override the old thumbnail with the new one from this representation
        for (const path in newContents) {
          item.contents[path] = newContents[path]
        }
      } else {
        // create item to save
        item = {
          id,
          name,
          description: '',
          thumbnail: THUMBNAIL_PATH,
          type: ItemType.WEARABLE,
          collectionId,
          totalSupply: 0,
          isPublished: false,
          isApproved: false,
          inCatalyst: false,
          rarity,
          data: {
            category,
            replaces: [],
            hides: [],
            tags: [],
            representations: []
          },
          owner: address!,
          metrics,
          contents: await this.computeHashes(contents!),
          createdAt: +new Date(),
          updatedAt: +new Date()
        }

        item.data.representations.push(...this.getBodyShapes(bodyShape, model, contents))
      }

      if (pristineItem && pristineItem.isPublished) {
        onSavePublished(item)
      } else {
        onSave(item, contents)
      }
    }
  }

  async computeHashes(contents: Record<string, Blob>) {
    const contentsAsHashes: Record<string, string> = {}
    for (const path in contents) {
      const blob = contents[path]
      const file = await makeContentFile(path, blob)
      const cid = await calculateBufferHash(file.content)
      contentsAsHashes[path] = cid
    }
    return contentsAsHashes
  }

  async processModel(model: string, contents: Record<string, Blob>): Promise<[string, string, ModelMetrics, Record<string, Blob>]> {
    let thumbnail: string = ''
    let metrics: ModelMetrics

    if (this.isPNGModel(model)) {
      metrics = {
        triangles: 100,
        materials: 1,
        textures: 1,
        meshes: 1,
        bodies: 1,
        entities: 1
      }
    } else {
      const url = URL.createObjectURL(contents[model])
      // const { image, info } = await getModelData(url, { width: 1024, height: 1024 })
      const { image, info } = await getModelData2(url, { width: 1024, height: 1024, extension: model.split('.')[1] })
      URL.revokeObjectURL(url)

      thumbnail = image
      metrics = info
    }

    if (this.hasCustomImage(model, contents)) {
      thumbnail = await blobToDataURL(contents[THUMBNAIL_PATH] || contents[model])
    }

    return [thumbnail, model, metrics, contents]
  }

  async updateThumbnail(category: WearableCategory) {
    const { model, contents } = this.state
    const url = URL.createObjectURL(contents![model!])

    let thumbnail
    if (contents && this.hasCustomImage(model, contents)) {
      thumbnail = await blobToDataURL(contents[THUMBNAIL_PATH] || contents[model!])
    } else {
      getModelData.toString()
      const { image } = await getModelData2(url, { thumbnailType: getThumbnailType(category), extension: model!.split('.')[1] })
      thumbnail = image
    }
    URL.revokeObjectURL(url)
    this.setState({ thumbnail })
  }

  getBodyShapes(bodyShape: BodyShapeType, model: string, contents: Record<string, Blob>): WearableRepresentation[] {
    const representations: WearableRepresentation[] = []

    // add male representation
    if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.UNISEX) {
      representations.push({
        bodyShapes: [WearableBodyShape.MALE],
        mainFile: model,
        contents: Object.keys(contents),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    // add female representation
    if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.UNISEX) {
      representations.push({
        bodyShapes: [WearableBodyShape.FEMALE],
        mainFile: model,
        contents: Object.keys(contents),
        overrideHides: [],
        overrideReplaces: []
      })
    }

    return representations
  }

  hasCustomImage = (model?: string, contents?: Record<string, Blob>) => {
    const hasCustomThumbnail = contents && THUMBNAIL_PATH in contents
    return hasCustomThumbnail || this.isPNGModel(model)
  }

  isPNGModel = (model: string = '') => {
    return model.endsWith('.png')
  }

  renderDropzoneCTA = (open: () => void) => {
    const { isLoading } = this.state
    return (
      <>
        {isLoading ? (
          <div className="overlay">
            <Loader active size="big" />
          </div>
        ) : null}
        <T
          id="asset_pack.import.cta"
          values={{
            models_link: (
              <span className="link" onClick={this.handleOpenDocs}>
                GLB, GLTF, PNG, ZIP
              </span>
            ),
            action: (
              <span className="action" onClick={open}>
                {t('import_modal.upload_manually')}
              </span>
            )
          }}
        />
      </>
    )
  }

  handleZipFile = async (file: File) => {
    const zip: JSZip = await JSZip.loadAsync(file)
    const fileNames: string[] = []

    zip.forEach(fileName => {
      if (!basename(fileName).startsWith('.')) {
        fileNames.push(fileName)
      }
    })

    const files = await Promise.all(
      fileNames
        .map(fileName => zip.file(fileName))
        .filter(file => !!file)
        .map(async file => {
          const blob = await file.async('blob')

          if (blob.size > MAX_FILE_SIZE) {
            throw new Error('File too big')
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

    const modelPath = fileNames.find(
      fileName => isComplexFile(fileName) || (fileName.indexOf(THUMBNAIL_PATH) === -1 && fileName.endsWith('png'))
    )

    if (!modelPath) {
      throw new Error('Missing model file')
    }

    return this.processModel(modelPath, contents)
  }

  handleModelFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File too big')
    }

    const modelPath = file.name
    const contents = {
      [modelPath]: file
    }

    return this.processModel(modelPath, contents)
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    this.setState({ isLoading: true })

    const { metadata } = this.props

    let changeItemFile = false
    let item = null

    if (metadata) {
      changeItemFile = metadata.changeItemFile
      item = metadata.item
    }

    const file = acceptedFiles[0]
    const extension = getExtension(file.name)

    try {
      if (!extension) {
        throw new Error('Wrong extension')
      }

      const handler = extension === '.zip' ? this.handleZipFile : this.handleModelFile
      const [thumbnail, model, metrics, contents] = await handler(file)

      this.setState({
        id: changeItemFile ? item!.id : uuid.v4(),
        view: CreateItemView.DETAILS,
        name: changeItemFile ? item!.name : cleanAssetName(file.name),
        thumbnail,
        model,
        metrics,
        contents,
        error: ''
      })
    } catch (error) {
      this.setState({ error: error.message })
    }
  }

  handleDropRejected = async (rejectedFiles: File[]) => {
    console.warn('rejected', rejectedFiles)
    this.setState({ error: 'Invalid files' })
  }

  handleOpenDocs = () => {
    window.open('https://docs.decentraland.org/3d-modeling/3d-models/', '_blank')
  }

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) => {
    this.setState({ name: props.value.slice(0, ITEM_NAME_MAX_LENGTH) })
  }

  handleItemChange = (item: Item) => this.setState({ item: item })

  handleCategoryChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const category = value as WearableCategory
    if (this.state.category !== category) {
      this.updateThumbnail(category)
      this.setState({ category })
    }
  }

  handleRarityChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const rarity = value as ItemRarity
    this.setState({ rarity })
  }

  handleYes = () => this.setState({ isRepresentation: true })

  handleNo = () => this.setState({ isRepresentation: false })

  renderModalTitle = () => {
    const isAddingRepresentation = this.isAddingRepresentation()
    const { bodyShape } = this.state
    const { metadata } = this.props
    if (isAddingRepresentation) {
      return t('create_item_modal.add_representation', { bodyShape: t(`body_shapes.${bodyShape}`) })
    }

    if (metadata && metadata.changeItemFile) {
      return t('create_item_modal.change_item_file')
    }

    return t('create_item_modal.title')
  }

  renderImportView() {
    const { onClose } = this.props
    const title = this.renderModalTitle()

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <FileImport
            accept={['.zip', '.gltf', '.glb', '.png']}
            onAcceptedFiles={this.handleDropAccepted}
            onRejectedFiles={this.handleDropRejected}
            renderAction={this.renderDropzoneCTA}
          />
        </Modal.Content>
      </>
    )
  }

  renderFields() {
    const { name, category, rarity, contents, item } = this.state

    const rarities = getRarities().map(value => ({ value, text: t(`wearable.rarity.${value}`) }))
    const categories = getCategories(contents).map(value => ({ value, text: t(`wearable.category.${value}`) }))

    return (
      <>
        <Field className="name" label={t('create_item_modal.name_label')} value={name} onChange={this.handleNameChange} />
        <SelectField
          label={t('create_item_modal.rarity_label')}
          placeholder={t('create_item_modal.rarity_placeholder')}
          value={rarity}
          options={rarities}
          onChange={this.handleRarityChange}
          disabled={item && item.isPublished}
        />
        <SelectField
          label={t('create_item_modal.category_label')}
          placeholder={t('create_item_modal.category_placeholder')}
          value={category}
          options={categories}
          onChange={this.handleCategoryChange}
        />
      </>
    )
  }

  renderDetailsView() {
    const { onClose, isLoading, metadata, error } = this.props
    const { name, thumbnail, metrics, bodyShape, isRepresentation, item, category, rarity } = this.state
    const isValid = !!name && !!thumbnail && !!metrics && !!bodyShape && !!category
    const isDisabled = !isValid || isLoading
    const isAddingRepresentation = this.isAddingRepresentation()
    const thumbnailStyle = rarity
      ? { backgroundImage: `radial-gradient(${RARITY_COLOR_LIGHT[rarity]}, ${RARITY_COLOR[rarity]})` }
      : undefined
    const title = this.renderModalTitle()

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <Form onSubmit={this.handleSubmit} disabled={isDisabled}>
            <Column>
              <Row className="details">
                <Column className="preview" width={192} grow={false}>
                  <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} />
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
                      <Header sub>{t('create_item_modal.representation_label')}</Header>
                      <Row>
                        {this.renderRepresentation(BodyShapeType.UNISEX)}
                        {this.renderRepresentation(BodyShapeType.MALE)}
                        {this.renderRepresentation(BodyShapeType.FEMALE)}
                      </Row>
                    </Section>
                  )}
                  {bodyShape && (!metadata || !metadata.changeItemFile) ? (
                    <>
                      {bodyShape === BodyShapeType.UNISEX ? (
                        this.renderFields()
                      ) : (
                        <>
                          {isAddingRepresentation ? null : (
                            <Section>
                              <Header sub>{t('create_item_modal.existing_item')}</Header>
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
                                  ? t('create_item_modal.adding_representation', { bodyShape: t(`body_shapes.${bodyShape}`) })
                                  : t('create_item_modal.pick_item', { bodyShape: t(`body_shapes.${bodyShape}`) })}
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
                  ) : null}
                </Column>
              </Row>
              <Row className="actions" align="right">
                <Button primary disabled={isDisabled} loading={isLoading}>
                  {metadata && metadata.changeItemFile ? t('global.save') : t('global.add')}
                </Button>
              </Row>
              {error ? (
                <Row className="error" align="right">
                  <p>{t('global.error_ocurred')}</p>{' '}
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
