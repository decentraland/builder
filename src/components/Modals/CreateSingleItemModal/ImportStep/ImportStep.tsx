import * as React from 'react'
import uuid from 'uuid'
import { loadFile, WearableConfig } from '@dcl/builder-client'
import { ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getExtension } from 'lib/file'
import { EngineType, getIsEmote } from 'lib/getModelData'
import { cleanAssetName, rawMappingsToObjectURL } from 'modules/asset/utils'
import { FileTooBigError, WrongExtensionError, InvalidFilesError, MissingModelFileError } from 'modules/item/errors'
import { BodyShapeType, IMAGE_EXTENSIONS, Item, ItemType, ITEM_EXTENSIONS, MODEL_EXTENSIONS } from 'modules/item/types'
import {
  getBodyShapeType,
  getBodyShapeTypeFromContents,
  getModelPath,
  getModelFileNameFromSubfolder,
  isImageCategory,
  isImageFile,
  isModelFile,
  isModelPath,
  MAX_FILE_SIZE
} from 'modules/item/utils'
import { blobToDataURL } from 'modules/media/utils'
import ItemImport from 'components/ItemImport'
import { AcceptedFileProps, ModelData } from '../CreateSingleItemModal.types'
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

  // Extract the models and images content from subfolders to the root level
  cleanContentModelKeys = (contents: Record<string, Blob>, bodyShapeType?: BodyShapeType) => {
    return Object.keys(contents).reduce((newContents: Record<string, Blob>, key: string) => {
      if (key.indexOf('/') !== -1) {
        if (contents[key].size === 0) {
          return newContents
        } else if (isModelFile(key) && bodyShapeType !== BodyShapeType.BOTH) {
          const newKeykey = getModelFileNameFromSubfolder(key)
          newContents[newKeykey] = contents[key]
          return newContents
        } else if (isImageFile(key)) {
          return newContents
        }
      }

      newContents[key] = contents[key]
      return newContents
    }, {})
  }

  /**
   * Unzip files and processes the model files.
   * One of the models will be taken into consideration if multiple models are uploaded.
   *
   * @param file - The ZIP file.
   */
  handleZippedModelFiles = async (file: File): Promise<{ modelData: ModelData; wearable?: WearableConfig }> => {
    const loadedFile = await loadFile(file.name, file)
    const { wearable, content } = loadedFile

    let modelPath: string | undefined

    if (wearable) {
      modelPath = getModelPath(wearable.data.representations)
    } else {
      modelPath = Object.keys(content).find(isModelPath)
    }

    if (!modelPath) {
      throw new MissingModelFileError()
    }

    return {
      modelData: await this.processModel(modelPath, content),
      wearable
    }
  }

  /**
   * Processes a model file.
   *
   * @param file - The model file.
   */
  handleModelFile = async (file: File): Promise<ModelData> => {
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

      let acceptedFileProps: AcceptedFileProps = {
        id: changeItemFile ? item!.id : uuid.v4(),
        name: changeItemFile ? item!.name : cleanAssetName(file.name),
        file,
        category: isRepresentation || changeItemFile ? category : undefined
      }

      if (extension === '.zip') {
        const { modelData, wearable } = await this.handleZippedModelFiles(file)
        const { type, model, contents } = modelData

        acceptedFileProps = {
          ...acceptedFileProps,
          type,
          model,
          contents
        }

        if (wearable) {
          let thumbnail: string | undefined

          if (thumbnail && thumbnail in modelData.contents) {
            thumbnail = await blobToDataURL(modelData.contents[thumbnail])
          }

          acceptedFileProps = {
            ...acceptedFileProps,
            thumbnail,
            name: wearable.name,
            description: wearable.description,
            rarity: wearable.rarity,
            category: wearable.data.category,
            bodyShape: getBodyShapeType(wearable as Item)
          }
        } else {
          /** If the .zip file doesn't contain an asset.json file,
           * this method processes the contents by cleaning the empty keys
           * and extracting the models to the root level if there's just one body shape representation
           */
          acceptedFileProps.bodyShape = getBodyShapeTypeFromContents(contents) as BodyShapeType
          if (acceptedFileProps.bodyShape !== BodyShapeType.BOTH) {
            acceptedFileProps.model = getModelFileNameFromSubfolder(model)
            acceptedFileProps.contents = this.cleanContentModelKeys(contents)
          } else {
            if (!isRepresentation) {
              acceptedFileProps.contents = this.cleanContentModelKeys(contents, BodyShapeType.BOTH)
            } else {
              throw new Error(t('create_single_item_modal.error.invalid_model_files_representation'))
            }
          }
        }
      } else {
        const { type, model, contents } = await this.handleModelFile(file)

        acceptedFileProps = {
          ...acceptedFileProps,
          type,
          model,
          contents
        }
      }

      const isEmote = acceptedFileProps.type === ItemType.EMOTE

      onDropAccepted({
        ...acceptedFileProps,
        bodyShape: isEmote ? BodyShapeType.BOTH : acceptedFileProps.bodyShape
      })
      this.setState({ error: '', isLoading: false })
    } catch (error) {
      this.setState({ error: error.message, isLoading: false })
    }
  }

  handleDropRejected = async (rejectedFiles: File[]) => {
    console.warn('rejected', rejectedFiles)
    const error = new InvalidFilesError()
    this.setState({ error: error.message })
  }

  async processModel(model: string, contents: Record<string, Blob>): Promise<ModelData> {
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
