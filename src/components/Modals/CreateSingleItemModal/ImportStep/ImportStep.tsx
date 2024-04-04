import * as React from 'react'
import uuid from 'uuid'
import {
  loadFile,
  SceneConfig,
  WearableConfig,
  AllowedMediaHostnameIsEmptyOrInvalidError,
  DuplicatedRequiredPermissionsError,
  MissingRequiredPropertiesError,
  UnknownRequiredPermissionsError,
  EmoteConfig,
  MAX_WEARABLE_FILE_SIZE,
  MAX_SKIN_FILE_SIZE,
  MAX_EMOTE_FILE_SIZE,
  FileTooBigError as FileTooBigErrorBuilderClient,
  FileType
} from '@dcl/builder-client/dist/files'
import { WearableCategory } from '@dcl/builder-client/dist/item'
import { ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getExtension } from 'lib/file'
import { isThirdParty } from 'lib/urn'
import { EngineType, getEmoteMetrics, getIsEmote } from 'lib/getModelData'
import { cleanAssetName, rawMappingsToObjectURL } from 'modules/asset/utils'
import {
  FileTooBigError,
  WrongExtensionError,
  InvalidFilesError,
  MissingModelFileError,
  EmoteDurationTooLongError,
  InvalidModelFilesRepresentation,
  InvalidModelFileType,
  CustomErrorWithTitle,
  ItemNotAllowedInThirdPartyCollections
} from 'modules/item/errors'
import {
  BodyShapeType,
  IMAGE_EXTENSIONS,
  Item,
  ItemType,
  ITEM_EXTENSIONS,
  MODEL_EXTENSIONS,
  SCENE_PATH,
  THUMBNAIL_PATH
} from 'modules/item/types'
import {
  getBodyShapeType,
  getBodyShapeTypeFromContents,
  getModelPath,
  getModelFileNameFromSubfolder,
  isImageCategory,
  isImageFile,
  isModelFile,
  isModelPath,
  MAX_EMOTE_DURATION,
  isSmart,
  getWearableCategories
} from 'modules/item/utils'
import { blobToDataURL } from 'modules/media/utils'
import { AnimationMetrics } from 'modules/models/types'
import ItemImport from 'components/ItemImport'
import { preventDefault } from 'lib/event'
import { AcceptedFileProps, ModelData } from '../CreateSingleItemModal.types'
import { Props, State } from './ImportStep.types'
import './ImportStep.css'

export default class ImportStep extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      id: '',
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
  handleZippedModelFiles = async (
    file: File
  ): Promise<{ modelData: ModelData; wearable?: WearableConfig; scene?: SceneConfig; emote?: EmoteConfig }> => {
    const loadedFile = await loadFile(file.name, file)
    const { wearable, scene, content, emote } = loadedFile

    if (emote && file.size > MAX_EMOTE_FILE_SIZE) {
      throw new FileTooBigError(MAX_EMOTE_FILE_SIZE)
    }

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
      wearable,
      emote,
      scene
    }
  }

  /**
   * Processes a model file.
   *
   * @param file - The model file.
   */
  handleModelFile = async (file: File): Promise<ModelData> => {
    const modelPath = file.name
    const contents = {
      [modelPath]: file
    }

    const { model, contents: proccessedContent, type } = await this.processModel(modelPath, contents)

    if (type === ItemType.EMOTE) {
      const info: AnimationMetrics = await getEmoteMetrics(contents[model])
      if (info.duration > MAX_EMOTE_DURATION) {
        throw new EmoteDurationTooLongError()
      }
    }

    const maxWearableFileSize =
      type === ItemType.WEARABLE && getWearableCategories(contents).includes(WearableCategory.SKIN)
        ? MAX_SKIN_FILE_SIZE
        : MAX_WEARABLE_FILE_SIZE

    const maxFileSize = type === ItemType.EMOTE ? MAX_EMOTE_FILE_SIZE : maxWearableFileSize
    if (file.size > maxFileSize) {
      throw new FileTooBigError(maxFileSize)
    }

    return { model, contents: proccessedContent, type }
  }

  handleErrorsOnFile = (error: any) => {
    this.setState({ error: undefined, isLoading: false })

    let errorTranslationId = null
    let wrongConfigurations: string[] = []

    if (error instanceof UnknownRequiredPermissionsError) {
      errorTranslationId = 'unknown_required_permissions'
      wrongConfigurations = error.getUnknownRequiredPermissions()
    } else if (error instanceof DuplicatedRequiredPermissionsError) {
      errorTranslationId = 'duplicated_required_permissions'
      wrongConfigurations = error.getDuplicatedRequiredPermissions()
    } else if (error instanceof AllowedMediaHostnameIsEmptyOrInvalidError) {
      errorTranslationId = 'allowed_media_hostnames_empty_or_invalid'
    } else if (error instanceof MissingRequiredPropertiesError) {
      errorTranslationId = 'missing_required_properties'
      wrongConfigurations = error.getMissingProperties()
    } else if (error instanceof FileTooBigErrorBuilderClient) {
      switch (error.getType()) {
        case FileType.WEARABLE:
        case FileType.SKIN: {
          errorTranslationId = 'wearable_too_big'
          break
        }
        case FileType.EMOTE: {
          errorTranslationId = 'emote_too_big'
          break
        }
        case FileType.THUMBNAIL: {
          errorTranslationId = 'thumbnail_too_big'
          break
        }
        default: {
          errorTranslationId = 'file_too_big'
          break
        }
      }
      wrongConfigurations = []
    }
    if (wrongConfigurations.length) {
      console.error(wrongConfigurations.map(it => `'${it}'`).join(', '))
    }

    this.setState({
      error: errorTranslationId
        ? new CustomErrorWithTitle(
            t(`create_single_item_modal.error.${errorTranslationId}.title`, {
              wrong_configurations: wrongConfigurations.map(it => `'${it}'`).join(', '),
              count: wrongConfigurations.length
            }),
            t(`create_single_item_modal.error.${errorTranslationId}.message`, {
              learn_more: (
                <span className="link" onClick={preventDefault(this.handleOpenLearnMoreOnError)}>
                  {t('global.learn_more')}
                </span>
              )
            })
          )
        : error.message,
      isLoading: false
    })
  }

  handleOpenLearnMoreOnError = () => {
    window.open('https://docs.decentraland.org/creator/development-guide/sdk7/scene-metadata/', '_blank', 'noopener noreferrer')
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { collection, category, metadata, isRepresentation, onDropAccepted } = this.props

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
        id: changeItemFile ? item?.id : uuid.v4(),
        name: changeItemFile ? item?.name : cleanAssetName(file.name),
        file,
        category: isRepresentation || changeItemFile ? category : undefined
      }

      if (extension === '.zip') {
        const { modelData, wearable, scene, emote } = await this.handleZippedModelFiles(file)
        const { type, model, contents } = modelData

        if (scene) {
          contents[SCENE_PATH] = new Blob([JSON.stringify(scene)], { type: 'application/json' })
        }

        acceptedFileProps = {
          ...acceptedFileProps,
          type,
          model,
          contents,
          thumbnail: THUMBNAIL_PATH in modelData.contents ? await blobToDataURL(modelData.contents[THUMBNAIL_PATH]) : undefined
        }
        if (wearable) {
          acceptedFileProps = {
            ...acceptedFileProps,
            name: wearable.name,
            description: wearable.description,
            rarity: wearable.rarity,
            category: wearable.data.category,
            bodyShape: getBodyShapeType(wearable as Item),
            requiredPermissions: scene?.requiredPermissions,
            tags: wearable.data.tags,
            blockVrmExport: wearable.data.blockVrmExport
          }
        } else if (emote) {
          acceptedFileProps = {
            ...acceptedFileProps,
            name: emote.name,
            description: emote.description,
            rarity: emote.rarity,
            category: emote.category,
            playMode: emote.play_mode,
            tags: emote.tags
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
              throw new InvalidModelFilesRepresentation()
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

      if (!!metadata && changeItemFile && acceptedFileProps.type !== metadata.item.type) {
        throw new InvalidModelFileType(metadata.item.type)
      }

      const isEmote = acceptedFileProps.type === ItemType.EMOTE

      if (collection && isThirdParty(collection.urn) && (isEmote || isSmart(acceptedFileProps))) {
        const type = acceptedFileProps.type === ItemType.WEARABLE ? (isSmart(acceptedFileProps) ? 'smart_wearable' : 'wearable') : 'emote'
        throw new ItemNotAllowedInThirdPartyCollections(type)
      }

      onDropAccepted({
        ...acceptedFileProps,
        bodyShape: isEmote || isSmart(acceptedFileProps) ? BodyShapeType.BOTH : acceptedFileProps.bodyShape
      })
    } catch (error) {
      this.handleErrorsOnFile(error)
    }
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    console.warn('rejected', rejectedFiles)
    this.setState({ error: new InvalidFilesError() })
  }

  async processModel(model: string, contents: Record<string, Blob>): Promise<ModelData> {
    const url = URL.createObjectURL(contents[model])
    const extension = getExtension(model) || undefined
    let isEmote = false

    if (extension !== '.png') {
      isEmote = await getIsEmote(url, {
        mappings: rawMappingsToObjectURL(contents),
        width: 1024,
        height: 1024,
        extension,
        engine: EngineType.BABYLON
      })
      URL.revokeObjectURL(url)
    }

    return { model, contents, type: isEmote ? ItemType.EMOTE : ItemType.WEARABLE }
  }

  handleOpenMoreInformation = () => {
    window.open('https://docs.decentraland.org/decentraland/creating-wearables/', '_blank', 'noopener noreferrer')
  }

  renderMoreInformation() {
    return (
      <span>
        {t('create_single_item_modal.import_information', {
          link: (
            <span className="link" onClick={preventDefault(this.handleOpenMoreInformation)}>
              {t('create_single_item_modal.import_information_link_label')}
            </span>
          )
        })}
      </span>
    )
  }

  render() {
    const { category, metadata, title, wearablePreviewComponent, isLoading, isRepresentation, onClose } = this.props
    const { error } = this.state

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="ImportStep">
          <ItemImport
            isLoading={isLoading}
            acceptedExtensions={
              isRepresentation || metadata?.changeItemFile
                ? isImageCategory(category as WearableCategory)
                  ? IMAGE_EXTENSIONS
                  : MODEL_EXTENSIONS
                : ITEM_EXTENSIONS
            }
            error={error}
            moreInformation={this.renderMoreInformation()}
            onDropAccepted={this.handleDropAccepted}
            onDropRejected={this.handleDropRejected}
          />
          {wearablePreviewComponent}
        </Modal.Content>
      </>
    )
  }
}
