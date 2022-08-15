import * as React from 'react'
import uuid from 'uuid'
import { loadFile } from '@dcl/builder-client'
import { WearableCategory } from '@dcl/schemas'
import { ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getExtension } from 'lib/file'
import { EngineType, getIsEmote } from 'lib/getModelData'
import { cleanAssetName } from 'modules/asset/utils'
import { FileTooBigError, WrongExtensionError, InvalidFilesError, MissingModelFileError } from 'modules/item/errors'
import { BodyShapeType, IMAGE_EXTENSIONS, ItemRarity, ItemType, ITEM_EXTENSIONS, MODEL_EXTENSIONS } from 'modules/item/types'
import { isImageCategory, isModelPath, MAX_FILE_SIZE } from 'modules/item/utils'
import { blobToDataURL } from 'modules/media/utils'
import ItemImport from 'components/ItemImport'
import { ItemAssetJson, ModelData } from '../CreateSingleItemModal.types'
import { validateEnum, validatePath } from '../utils'
import { Props, State } from './ImportStep.types'

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
  handleZippedModelFiles = async (file: File): Promise<ModelData> => {
    const loadedFile = await loadFile(file.name, file)
    const { wearable, content } = loadedFile

    let assetJson: ItemAssetJson | undefined
    let modelPath: string | undefined

    // wearable.json contains data to populate parts of the state
    if (wearable) {
      modelPath = getModelPath(wearable.data.representations)
      assetJson = {
        name: wearable.name,
        description: wearable.description,
        rarity: wearable.rarity,
        category: wearable.data.category,
        bodyShape: getBodyShapeType(wearable as Item)
      }
    } else {
      modelPath = Object.keys(content).find(isModelPath)
    }

    if (!modelPath) {
      throw new MissingModelFileError()
    }

    const result = await this.processModel(modelPath, content)

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
      width: 1024,
      height: 1024,
      extension: getExtension(model) || undefined,
      engine: EngineType.BABYLON
    })
    URL.revokeObjectURL(url)

    return { model, contents, type: isEmote ? ItemType.EMOTE : ItemType.WEARABLE }
  }

  render() {
    const { category, metadata, title, wearablePreviewComponent, isRepresentation, onClose } = this.props
    const { error } = this.state

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="ImportStep">
          <ItemImport
            error={error}
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
