import * as React from 'react'
import { basename } from 'path'
import uuid from 'uuid'
import JSZip from 'jszip'
import { WearableCategory } from '@dcl/schemas'
import { ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getExtension } from 'lib/file'
import { EngineType, getIsEmote } from 'lib/getModelData'
import { cleanAssetName, rawMappingsToObjectURL } from 'modules/asset/utils'
import { FileTooBigError, WrongExtensionError, InvalidFilesError, MissingModelFileError } from 'modules/item/errors'
import { BodyShapeType, IMAGE_EXTENSIONS, ItemRarity, ItemType, ITEM_EXTENSIONS, MODEL_EXTENSIONS } from 'modules/item/types'
import { isImageCategory, isModelPath, MAX_FILE_SIZE } from 'modules/item/utils'
import { blobToDataURL } from 'modules/media/utils'
import { ASSET_MANIFEST } from 'components/AssetImporter/utils'
import ItemImport from 'components/ItemImport'
import { ItemAssetJson } from '../CreateSingleItemModal.types'
import { validateEnum, validatePath } from '../utils'
import { Props, State } from './ImportStep.types'
import './ImportStep.css'

export default class ImportStep extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      id: '',
      error: '',
      isLoading: false
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

    return { ...result, assetJson }
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

    return { ...(await this.processModel(modelPath, contents)), assetJson: undefined }
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { category, metadata, isRepresentation, onDropAccepted } = this.props

    let changeItemFile = false
    let item = null

    if (metadata?.changeItemFile) {
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
      const { model, contents, type, assetJson } = await handler(file)
      const isEmote = type === ItemType.EMOTE

      onDropAccepted({
        id: changeItemFile ? item!.id : uuid.v4(),
        name: changeItemFile ? item!.name : cleanAssetName(file.name),
        file,
        type,
        model,
        contents,
        bodyShape: isEmote ? BodyShapeType.BOTH : undefined,
        category: isRepresentation ? category : undefined,
        ...(await this.getAssetJsonProps(assetJson, contents))
      })
      this.setState({ error: '', isLoading: false })
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

  async processModel(
    model: string,
    contents: Record<string, Blob>
  ): Promise<{ model: string; contents: Record<string, Blob>; type: ItemType }> {
    const url = URL.createObjectURL(contents[model])
    const isEmote = await getIsEmote(url, {
      mappings: rawMappingsToObjectURL(contents),
      width: 1024,
      height: 1024,
      extension: getExtension(model) || undefined,
      engine: EngineType.BABYLON
    })
    URL.revokeObjectURL(url)

    return { model, contents, type: isEmote ? ItemType.EMOTE : ItemType.WEARABLE }
  }

  render() {
    const { category, metadata, title, wearablePreviewComponent, isLoading, isRepresentation, onClose } = this.props
    const { error } = this.state

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="ImportStep">
          <ItemImport
            error={error}
            isLoading={isLoading}
            acceptedExtensions={
              isRepresentation || metadata?.changeItemFile
                ? isImageCategory(category!)
                  ? IMAGE_EXTENSIONS
                  : MODEL_EXTENSIONS
                : ITEM_EXTENSIONS
            }
            onDropAccepted={this.handleDropAccepted}
            onDropRejected={this.handleDropRejected}
          />
          {wearablePreviewComponent}
        </Modal.Content>
      </>
    )
  }
}
