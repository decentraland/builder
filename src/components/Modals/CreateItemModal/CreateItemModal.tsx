import * as React from 'react'
import { basename } from 'path'
import uuid from 'uuid'
import JSZip from 'jszip'
import { ModalNavigation, Loader, Row, Column, Button, Field, Section, Header, InputOnChangeData } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { cleanAssetName, MAX_NAME_LENGTH } from 'modules/asset/utils'
import { dataURLToBlob } from 'modules/media/utils'
import { THUMBNAIL_PATH, Item, ItemType, WearableBodyShape, BodyShapeType } from 'modules/item/types'
import { getModelData } from 'lib/getModelData'
import { makeContentFile, calculateBufferHash } from 'modules/deployment/contentUtils'
import FileImport from 'components/FileImport'
import ItemDropdown from 'components/ItemDropdown'
import { getExtension, MAX_FILE_SIZE } from 'lib/file'
import { ModelMetrics } from 'modules/scene/types'
import { getMissingBodyShapeType } from 'modules/item/utils'
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

    const { collectionId, addRepresentationTo } = metadata as CreateItemModalMetadata
    state.collectionId = collectionId

    if (addRepresentationTo) {
      const missingBodyShape = getMissingBodyShapeType(addRepresentationTo)
      if (missingBodyShape) {
        state.id = addRepresentationTo.id
        state.name = addRepresentationTo.name
        state.bodyShape = missingBodyShape
        state.isRepresentation = true
        state.addRepresentationTo = addRepresentationTo
        state.collectionId = addRepresentationTo.collectionId
      }
    }

    return state
  }

  isAddingRepresentation = () => {
    const { metadata } = this.props
    return !!(metadata && metadata.addRepresentationTo)
  }

  filterItemsByBodyShape = (item: Item) => {
    const { bodyShape } = this.state
    return getMissingBodyShapeType(item) === bodyShape
  }

  async handleSubmit() {
    const { address, onSubmit } = this.props
    const { id, name, model, bodyShape, contents, metrics, collectionId, isRepresentation, addRepresentationTo } = this.state

    if (id && name && model && bodyShape && contents && metrics) {
      let item: Item | undefined

      // add this item as a representation of an existing item
      if (isRepresentation && addRepresentationTo) {
        item = {
          ...addRepresentationTo,
          data: {
            ...addRepresentationTo.data,
            representations: [...addRepresentationTo.data.representations],
            replaces: [...addRepresentationTo.data.replaces],
            hides: [...addRepresentationTo.data.hides],
            tags: [...addRepresentationTo.data.tags]
          },
          contents: {
            ...addRepresentationTo.contents
          },
          updatedAt: +new Date()
        }

        // add new representation
        item.data.representations.push({
          bodyShape: bodyShape === BodyShapeType.MALE ? [WearableBodyShape.MALE] : [WearableBodyShape.FEMALE],
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
      } else {
        // create new item
        item = {
          id,
          name,
          thumbnail: THUMBNAIL_PATH,
          type: ItemType.WEARABLE,
          collectionId,
          totalSupply: 0,
          isPublished: false,
          isApproved: false,
          data: {
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

        // add male representation
        if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.UNISEX) {
          item.data.representations.push({
            bodyShape: [WearableBodyShape.MALE],
            mainFile: model,
            contents: Object.keys(contents),
            overrideHides: [],
            overrideReplaces: []
          })
        }

        // add female representation
        if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.UNISEX) {
          item.data.representations.push({
            bodyShape: [WearableBodyShape.FEMALE],
            mainFile: model,
            contents: Object.keys(contents),
            overrideHides: [],
            overrideReplaces: []
          })
        }
      }

      onSubmit(item, contents)
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
    const url = URL.createObjectURL(contents[model])
    const { image: thumbnail, info: metrics } = await getModelData(url)
    if (!contents[THUMBNAIL_PATH]) {
      const thumbnailBlob = dataURLToBlob(thumbnail)
      if (thumbnailBlob) {
        contents[THUMBNAIL_PATH] = thumbnailBlob
      }
    }

    return [thumbnail, model, metrics, contents]
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
                GLB, GLTF, ZIP
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

    const modelPath = fileNames.find(fileName => fileName.endsWith('gltf') || fileName.endsWith('glb'))

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

    const file = acceptedFiles[0]
    const extension = getExtension(file.name)

    try {
      if (!extension) {
        throw new Error('Wrong extension')
      }

      const handler = extension === '.zip' ? this.handleZipFile : this.handleModelFile
      const [thumbnail, model, metrics, contents] = await handler(file)

      this.setState({
        id: uuid.v4(),
        view: CreateItemView.DETAILS,
        name: cleanAssetName(file.name),
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
    this.setState({ name: props.value.slice(0, MAX_NAME_LENGTH) })
  }

  handleItemChange = (item: Item) => this.setState({ addRepresentationTo: item })

  handleYes = () => this.setState({ isRepresentation: true })

  handleNo = () => this.setState({ isRepresentation: false })

  renderImportView() {
    const { onClose } = this.props
    const isAddingRepresentation = this.isAddingRepresentation()
    const { bodyShape } = this.state
    return (
      <>
        <ModalNavigation
          title={
            isAddingRepresentation
              ? t('create_item_modal.add_representation', { bodyShape: t(`body_shapes.${bodyShape}`) })
              : t('create_item_modal.title')
          }
          onClose={onClose}
        />
        <Modal.Content>
          <FileImport
            accept={['.zip', '.gltf', '.glb']}
            onAcceptedFiles={this.handleDropAccepted}
            onRejectedFiles={this.handleDropRejected}
            renderAction={this.renderDropzoneCTA}
          />
        </Modal.Content>
      </>
    )
  }

  renderDetailsView() {
    const { onClose, isLoading } = this.props
    const { name, thumbnail, metrics, bodyShape, isRepresentation, addRepresentationTo } = this.state
    const isValid = !!name && !!thumbnail && !!metrics && !!bodyShape
    const isAddingRepresentation = this.isAddingRepresentation()
    return (
      <>
        <ModalNavigation
          title={
            isAddingRepresentation
              ? t('create_item_modal.add_representation', { bodyShape: t(`body_shapes.${bodyShape}`) })
              : t('create_item_modal.title')
          }
          onClose={onClose}
        />
        <Modal.Content>
          <Column>
            <Row className="details">
              <Column className="preview" width={192} grow={false}>
                <img className="thumbnail" src={thumbnail || undefined} />
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
                {bodyShape ? (
                  <>
                    {bodyShape === BodyShapeType.UNISEX ? (
                      <Field className="name" label={t('create_item_modal.name_label')} value={name} onChange={this.handleNameChange} />
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
                              value={addRepresentationTo}
                              filter={this.filterItemsByBodyShape}
                              onChange={this.handleItemChange}
                              isDisabled={isAddingRepresentation}
                            />
                          </Section>
                        ) : (
                          <Field className="name" label={t('create_item_modal.name_label')} value={name} onChange={this.handleNameChange} />
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </Column>
            </Row>
            <Row className="actions" align="right">
              <Button primary onClick={() => this.handleSubmit()} disabled={!isValid || isLoading} loading={isLoading}>
                {t('global.add')}
              </Button>
            </Row>
          </Column>
        </Modal.Content>
      </>
    )
  }

  renderRepresentation(type: BodyShapeType) {
    const { bodyShape } = this.state
    return (
      <div
        className={`option has-icon ${type} ${type === bodyShape ? 'active' : ''}`.trim()}
        onClick={() => this.setState({ bodyShape: type, isRepresentation: undefined, addRepresentationTo: undefined })}
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
