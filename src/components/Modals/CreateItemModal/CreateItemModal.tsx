import * as React from 'react'
import { basename } from 'path'
import uuid from 'uuid'
import JSZip from 'jszip'
import { ModalNavigation, Loader, Row, Column, Button, Field, Section, Header } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { cleanAssetName, MAX_NAME_LENGTH } from 'modules/asset/utils'
import { dataURLToBlob } from 'modules/media/utils'
import { THUMBNAIL_PATH, Item, ItemType, WearableRepresentation, WearableBodyShape, BodyShapeType } from 'modules/item/types'
import { getModelData } from 'lib/getModelData'
import { makeContentFile, calculateBufferHash } from 'modules/deployment/contentUtils'
import FileImport from 'components/FileImport'
import { getExtension, MAX_FILE_SIZE } from 'lib/file'
import { ModelMetrics } from 'modules/scene/types'
import { Props, State, CreateItemView } from './CreateItemModal.types'
import './CreateItemModal.css'

export default class CreateItemModal extends React.PureComponent<Props, State> {
  state: State = {
    view: CreateItemView.IMPORT
  }

  async handleSubmit() {
    const { onSubmit } = this.props
    const { id, name, model, bodyShape, contents, metrics } = this.state

    if (id && name && model && bodyShape && contents && metrics) {
      const representations: WearableRepresentation[] = []

      // add male representation
      if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.UNISEX) {
        representations.push({
          bodyShape: [WearableBodyShape.MALE],
          mainFile: model,
          contents: Object.keys(contents),
          overrideHides: [],
          overrideReplaces: []
        })
      }

      // add female representation
      if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.UNISEX) {
        representations.push({
          bodyShape: [WearableBodyShape.FEMALE],
          mainFile: model,
          contents: Object.keys(contents),
          overrideHides: [],
          overrideReplaces: []
        })
      }

      const item: Item = {
        id,
        name,
        thumbnail: THUMBNAIL_PATH,
        type: ItemType.WEARABLE,
        data: {
          replaces: [],
          hides: [],
          tags: [],
          representations
        },
        owner: '',
        metrics,
        contents: await this.computeHashes(contents!)
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

  renderImportView() {
    const { onClose } = this.props
    return (
      <>
        <ModalNavigation title={t('create_item_modal.title')} onClose={onClose} />
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
    const { name, thumbnail, metrics, bodyShape } = this.state
    const isValid = !!name && !!thumbnail && !!metrics && !!bodyShape
    return (
      <>
        <ModalNavigation title={t('create_item_modal.title')} onClose={onClose} />
        <Modal.Content>
          <Column>
            <Row className="details">
              <Column className="preview" width={192} grow={false}>
                <img className="thumbnail" src={thumbnail || undefined} />
                {metrics ? (
                  <div className="metrics">
                    <div className="metric triangles">{t('create_item_modal.metrics.triangles', { count: metrics.triangles })}</div>
                    <div className="metric materials">{t('create_item_modal.metrics.materials', { count: metrics.materials })}</div>
                    <div className="metric textures">{t('create_item_modal.metrics.textures', { count: metrics.textures })}</div>
                  </div>
                ) : null}
              </Column>
              <Column className="data" grow={true}>
                <Section>
                  <Header sub>{t('create_item_modal.representation_label')}</Header>
                  <Row>
                    {this.renderRepresentation(BodyShapeType.UNISEX)}
                    {this.renderRepresentation(BodyShapeType.MALE)}
                    {this.renderRepresentation(BodyShapeType.FEMALE)}
                  </Row>
                </Section>
                {bodyShape ? (
                  <Field
                    className="name"
                    label={t('create_item_modal.name_label')}
                    value={name}
                    onChange={(_event, props) => this.setState({ name: props.value.slice(0, MAX_NAME_LENGTH) })}
                  />
                ) : null}
              </Column>
            </Row>
            <Row className="actions" align="right">
              <Button primary onClick={() => this.handleSubmit()} disabled={!isValid || isLoading} loading={isLoading}>
                {t('create_item_modal.add')}
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
        className={`representation ${type} ${type === bodyShape ? 'active' : ''}`.trim()}
        onClick={() => this.setState({ bodyShape: type })}
      >
        {t('global.representation.' + type)}
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
