import React, { useState, useRef, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import {
  BodyPartCategory,
  BodyShape,
  EmoteCategory,
  EmoteDataADR74,
  Rarity,
  PreviewProjection,
  WearableCategory,
  Mapping,
  MappingType,
  ContractNetwork,
  ContractAddress
} from '@dcl/schemas'
import {
  MAX_EMOTE_FILE_SIZE,
  MAX_SKIN_FILE_SIZE,
  MAX_THUMBNAIL_FILE_SIZE,
  MAX_WEARABLE_FILE_SIZE,
  MAX_SMART_WEARABLE_FILE_SIZE
} from '@dcl/builder-client/dist/files/constants'
import {
  ModalNavigation,
  Row,
  Column,
  Button,
  Form,
  Field,
  Icon as DCLIcon,
  Section,
  Header,
  InputOnChangeData,
  SelectField,
  DropdownProps,
  Message
} from 'decentraland-ui'
import { WearablePreview } from 'decentraland-ui2'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { getImageType, dataURLToBlob, convertImageIntoWearableThumbnail } from 'modules/media/utils'
import { ImageType } from 'modules/media/types'
import {
  THUMBNAIL_PATH,
  Item,
  BodyShapeType,
  ITEM_NAME_MAX_LENGTH,
  WearableRepresentation,
  ItemType,
  EmotePlayMode,
  VIDEO_PATH,
  WearableData,
  SyncStatus
} from 'modules/item/types'
import { Metrics } from 'modules/models/types'
import { computeHashes } from 'modules/deployment/contentUtils'
import {
  getBodyShapeType,
  getMissingBodyShapeType,
  getWearableCategories,
  getBackgroundStyle,
  isImageFile,
  resizeImage,
  getEmoteCategories,
  getEmotePlayModes,
  getBodyShapeTypeFromContents,
  isSmart,
  isWearable,
  buildItemMappings,
  isEmoteFileSizeValid,
  isSkinFileSizeValid,
  isSmartWearableFileSizeValid,
  isWearableFileSizeValid
} from 'modules/item/utils'
import { EngineType, getItemData, getModelData } from 'lib/getModelData'
import { getExtension, toMB } from 'lib/file'
import {
  getDefaultThirdPartyUrnSuffix,
  buildThirdPartyURN,
  DecodedURN,
  decodeURN,
  isThirdParty,
  isThirdPartyCollectionDecodedUrn
} from 'lib/urn'
import ItemDropdown from 'components/ItemDropdown'
import Icon from 'components/Icon'
import ItemVideo from 'components/ItemVideo'
import ItemRequiredPermission from 'components/ItemRequiredPermission'
import ItemProperties from 'components/ItemProperties'
import { Collection } from 'modules/collection/types'
import { LinkedContract } from 'modules/thirdParty/types'
import { calculateFileSize, calculateModelFinalSize } from 'modules/item/export'
import { MAX_THUMBNAIL_SIZE } from 'modules/assetPack/utils'
import { areMappingsValid } from 'modules/thirdParty/utils'
import { Authorization } from 'lib/api/auth'
import { MappingEditor } from 'components/MappingEditor'
import { BUILDER_SERVER_URL, BuilderAPI } from 'lib/api/builder'
import EditPriceAndBeneficiaryModal from '../EditPriceAndBeneficiaryModal'
import ImportStep from './ImportStep/ImportStep'
import EditThumbnailStep from './EditThumbnailStep/EditThumbnailStep'
import UploadVideoStep from './UploadVideoStep/UploadVideoStep'
import { getThumbnailType, toEmoteWithBlobs, toWearableWithBlobs } from './utils'
import {
  Props,
  State,
  CreateItemView,
  CreateSingleItemModalMetadata,
  StateData,
  SortedContent,
  AcceptedFileProps
  // ITEM_LOADED_CHECK_DELAY
} from './CreateSingleItemModal.types'
import './CreateSingleItemModal.css'

const defaultMapping: Mapping = { type: MappingType.ANY }

/**
 * Prefixes the content name by adding the adding the body shape name to it.
 *
 * @param bodyShape - The body shaped used to prefix the content name.
 * @param contentKey - The content key or name to be prefixed.
 */
const prefixContentName = (bodyShape: BodyShapeType, contentKey: string): string => {
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
const prefixContents = (bodyShape: BodyShapeType, contents: Record<string, Blob>): Record<string, Blob> => {
  return Object.keys(contents).reduce((newContents: Record<string, Blob>, key: string) => {
    // Do not include the thumbnail, scenes, and video in each of the body shapes
    if ([THUMBNAIL_PATH, VIDEO_PATH].includes(key)) {
      return newContents
    }
    newContents[prefixContentName(bodyShape, key)] = contents[key]
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
const sortContent = (bodyShape: BodyShapeType, contents: Record<string, Blob>): SortedContent => {
  const male = bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE ? prefixContents(BodyShapeType.MALE, contents) : {}
  const female =
    bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE ? prefixContents(BodyShapeType.FEMALE, contents) : {}

  const all: Record<string, Blob> = {
    [THUMBNAIL_PATH]: contents[THUMBNAIL_PATH],
    ...male,
    ...female
  }

  if (contents[VIDEO_PATH]) {
    all[VIDEO_PATH] = contents[VIDEO_PATH]
  }

  return { male, female, all }
}

const sortContentZipBothBodyShape = (bodyShape: BodyShapeType, contents: Record<string, Blob>): SortedContent => {
  let male: Record<string, Blob> = {}
  let female: Record<string, Blob> = {}
  const both: Record<string, Blob> = {}

  for (const [key, value] of Object.entries(contents)) {
    if (key.startsWith('male/') && (bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE)) {
      male[key] = value
    } else if (key.startsWith('female/') && (bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE)) {
      female[key] = value
    } else {
      both[key] = value
    }
  }

  male = {
    ...male,
    ...(bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE ? prefixContents(BodyShapeType.MALE, both) : {})
  }

  female = {
    ...female,
    ...(bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE ? prefixContents(BodyShapeType.FEMALE, both) : {})
  }

  const all = {
    [THUMBNAIL_PATH]: contents[THUMBNAIL_PATH],
    ...male,
    ...female
  }

  return { male, female, all }
}

const buildRepresentations = (bodyShape: BodyShapeType, model: string, contents: SortedContent): WearableRepresentation[] => {
  const representations: WearableRepresentation[] = []

  // add male representation
  if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.MALE],
      mainFile: prefixContentName(BodyShapeType.MALE, model),
      contents: Object.keys(contents.male),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  // add female representation
  if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.FEMALE],
      mainFile: prefixContentName(BodyShapeType.FEMALE, model),
      contents: Object.keys(contents.female),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  return representations
}

const buildRepresentationsZipBothBodyshape = (bodyShape: BodyShapeType, contents: SortedContent): WearableRepresentation[] => {
  const representations: WearableRepresentation[] = []

  // add male representation
  if (bodyShape === BodyShapeType.MALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.MALE],
      mainFile: Object.keys(contents.male).find(content => content.includes('glb'))!,
      contents: Object.keys(contents.male),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  // add female representation
  if (bodyShape === BodyShapeType.FEMALE || bodyShape === BodyShapeType.BOTH) {
    representations.push({
      bodyShapes: [BodyShape.FEMALE],
      mainFile: Object.keys(contents.female).find(content => content.includes('glb'))!,
      contents: Object.keys(contents.female),
      overrideHides: [],
      overrideReplaces: []
    })
  }

  return representations
}

const getDefaultMappings = (
  contract: LinkedContract | undefined,
  isThirdPartyV2Enabled: boolean
): Partial<Record<ContractNetwork, Record<ContractAddress, Mapping[]>>> | undefined => {
  if (!isThirdPartyV2Enabled || !contract) {
    return undefined
  }

  return {
    [contract.network]: {
      [contract.address]: [defaultMapping]
    }
  }
}

const getLinkedContract = (collection: Collection | undefined | null): LinkedContract | undefined => {
  if (!collection?.linkedContractAddress || !collection?.linkedContractNetwork) {
    return undefined
  }

  return {
    address: collection.linkedContractAddress,
    network: collection.linkedContractNetwork
  }
}

const getPlayModeOptions = () => {
  const playModes: string[] = getEmotePlayModes()

  return playModes.map(value => ({
    value,
    text: t(`emote.play_mode.${value}.text`),
    description: t(`emote.play_mode.${value}.description`)
  }))
}

export const CreateSingleItemModal: React.FC<Props> = props => {
  const { address, collection, error, itemStatus, metadata, name, onClose, onSave, isLoading, isThirdPartyV2Enabled } = props
  const thumbnailInput = useRef<HTMLInputElement>(null)
  const modalContainer = useRef<HTMLDivElement>(null)

  const getInitialState = useCallback((): State => {
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
    const contract = collection ? getLinkedContract(collection) : undefined

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
      state.mappings = item.mappings ?? getDefaultMappings(contract, isThirdPartyV2Enabled)

      if (addRepresentation) {
        const missingBodyShape = getMissingBodyShapeType(item)
        if (missingBodyShape) {
          state.bodyShape = missingBodyShape
          state.isRepresentation = true
        }
      }
    } else {
      state.mappings = getDefaultMappings(contract, isThirdPartyV2Enabled)
    }

    return state
  }, [collection, metadata, isThirdPartyV2Enabled])

  const [state, setState] = useState<State>(() => getInitialState())

  const createItem = useCallback(
    async (sortedContents: SortedContent, representations: WearableRepresentation[]) => {
      const {
        id,
        name,
        description,
        type,
        metrics,
        collectionId,
        category,
        playMode,
        rarity,
        hasScreenshotTaken,
        requiredPermissions,
        tags,
        blockVrmExport,
        mappings
      } = state as StateData

      const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection?.urn)
      // If it's a third party item, we need to automatically create an URN for it by generating a random uuid different from the id
      const decodedCollectionUrn: DecodedURN<any> | null = collection?.urn ? decodeURN(collection.urn) : null
      let urn: string | undefined
      if (decodedCollectionUrn && isThirdPartyCollectionDecodedUrn(decodedCollectionUrn)) {
        urn = buildThirdPartyURN(
          decodedCollectionUrn.thirdPartyName,
          decodedCollectionUrn.thirdPartyCollectionId,
          getDefaultThirdPartyUrnSuffix(name)
        )
      }

      // create item to save
      let data: WearableData | EmoteDataADR74

      if (type === ItemType.WEARABLE) {
        const removesDefaultHiding = category === WearableCategory.UPPER_BODY ? [BodyPartCategory.HANDS] : []
        data = {
          category: category as WearableCategory,
          replaces: [],
          hides: [],
          removesDefaultHiding,
          tags: tags || [],
          representations: [...representations],
          requiredPermissions: requiredPermissions || [],
          blockVrmExport: blockVrmExport ?? false,
          outlineCompatible: true // it's going to be true for all the items. It can be deactivated later in the editor view
        } as WearableData
      } else {
        data = {
          category: category as EmoteCategory,
          loop: playMode === EmotePlayMode.LOOP,
          tags: tags || [],
          representations: [...representations]
        } as EmoteDataADR74
      }

      const contents = await computeHashes(sortedContents.all)

      const item: Item<ItemType.WEARABLE | ItemType.EMOTE> = {
        id,
        name,
        urn,
        description: description || '',
        thumbnail: THUMBNAIL_PATH,
        video: contents[VIDEO_PATH],
        type,
        collectionId,
        totalSupply: 0,
        isPublished: false,
        isApproved: false,
        inCatalyst: false,
        blockchainContentHash: null,
        currentContentHash: null,
        catalystContentHash: null,
        rarity: belongsToAThirdPartyCollection ? Rarity.UNIQUE : rarity,
        data,
        owner: address!,
        metrics,
        contents,
        mappings: belongsToAThirdPartyCollection && mappings ? mappings : null,
        createdAt: +new Date(),
        updatedAt: +new Date()
      }

      // If it's a Third Party Item, don't prompt the user with the SET PRICE view
      if ((hasScreenshotTaken || type !== ItemType.EMOTE) && belongsToAThirdPartyCollection) {
        item.price = '0'
        item.beneficiary = ethers.constants.AddressZero
        return onSave(item as Item, sortedContents.all)
      }

      if (hasScreenshotTaken || type !== ItemType.EMOTE) {
        item.price = ethers.constants.MaxUint256.toString()
        item.beneficiary = item.beneficiary || address
        return onSave(item as Item, sortedContents.all)
      }

      setState(prev => ({
        ...prev,
        item,
        itemSortedContents: sortedContents.all,
        view: CreateItemView.THUMBNAIL,
        fromView: CreateItemView.THUMBNAIL
      }))
    },
    [address, collection, state, onSave, setState]
  )

  const addItemRepresentation = useCallback(
    async (sortedContents: SortedContent, representations: WearableRepresentation[]) => {
      const { bodyShape, item: editedItem, requiredPermissions } = state as StateData
      const hashedContents = await computeHashes(bodyShape === BodyShapeType.MALE ? sortedContents.male : sortedContents.female)
      if (isWearable(editedItem)) {
        const removesDefaultHiding =
          editedItem.data.category === WearableCategory.UPPER_BODY || editedItem.data.hides.includes(WearableCategory.UPPER_BODY)
            ? [BodyPartCategory.HANDS]
            : []
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
            removesDefaultHiding: removesDefaultHiding,
            tags: [...editedItem.data.tags],
            requiredPermissions: requiredPermissions || [],
            blockVrmExport: editedItem.data.blockVrmExport,
            outlineCompatible: editedItem.data.outlineCompatible || true // it's going to be true for all the items. It can be deactivated later in the editor view
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
    },
    [state, onSave]
  )

  const modifyItem = useCallback(
    async (pristineItem: Item, sortedContents: SortedContent, representations: WearableRepresentation[]) => {
      const { name, bodyShape, type, mappings, metrics, category, playMode, requiredPermissions } = state as StateData

      let data: WearableData | EmoteDataADR74

      if (type === ItemType.WEARABLE) {
        const removesDefaultHiding = category === WearableCategory.UPPER_BODY ? [BodyPartCategory.HANDS] : []
        data = {
          ...pristineItem.data,
          removesDefaultHiding,
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

      const contents = await computeHashes(sortedContents.all)

      const item = {
        ...pristineItem,
        data,
        name,
        metrics,
        contents,
        mappings,
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

      if (itemStatus && [SyncStatus.UNPUBLISHED, SyncStatus.UNDER_REVIEW].includes(itemStatus) && isSmart(item) && VIDEO_PATH in contents) {
        item.video = contents[VIDEO_PATH]
      }

      onSave(item as Item, sortedContents.all)
    },
    [itemStatus, state, onSave]
  )

  const isValid = useCallback((): boolean => {
    const {
      name,
      thumbnail,
      metrics,
      bodyShape,
      category,
      playMode,
      rarity,
      item,
      isRepresentation,
      type,
      modelSize,
      mappings,
      error: stateError
    } = state
    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const linkedContract = collection ? getLinkedContract(collection) : undefined

    if (stateError) {
      setState(prev => ({ ...prev, error: undefined }))
    }

    let required: (string | Metrics | Item | undefined)[]
    if (isRepresentation) {
      required = [item as Item]
    } else if (belongsToAThirdPartyCollection) {
      required = [name, thumbnail, metrics, bodyShape, category]
    } else if (type === ItemType.EMOTE) {
      required = [name, thumbnail, metrics, category, playMode, rarity, type]
    } else {
      required = [name, thumbnail, metrics, bodyShape, category, rarity, type]
    }

    const thumbnailBlob = thumbnail ? dataURLToBlob(thumbnail) : undefined
    const thumbnailSize = thumbnailBlob ? calculateFileSize(thumbnailBlob) : 0

    if (thumbnailSize && thumbnailSize > MAX_THUMBNAIL_SIZE) {
      setState(prev => ({
        ...prev,
        error: t('create_single_item_modal.error.thumbnail_file_too_big', { maxSize: `${toMB(MAX_THUMBNAIL_FILE_SIZE)}MB` })
      }))
      return false
    }
    const isSkin = category === WearableCategory.SKIN
    const isEmote = type === ItemType.EMOTE
    const isSmartWearable = isSmart({ type, contents: state.contents })
    const isRequirementMet = required.every(prop => prop !== undefined)
    const finalSize = modelSize ? modelSize + thumbnailSize : undefined

    if (isThirdPartyV2Enabled && ((!mappings && linkedContract) || (mappings && !areMappingsValid(mappings)))) {
      return false
    }

    if (isRequirementMet && isEmote && finalSize && !isEmoteFileSizeValid(finalSize)) {
      setState(prev => ({
        ...prev,
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_EMOTE_FILE_SIZE)}MB`,
          type: `emote`
        })
      }))
      return false
    }

    if (isRequirementMet && isSkin && finalSize && !isSkinFileSizeValid(finalSize)) {
      setState(prev => ({
        ...prev,
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_SKIN_FILE_SIZE)}MB`,
          type: `skin`
        })
      }))
      return false
    }

    if (isRequirementMet && !isSkin && isSmartWearable && finalSize && !isSmartWearableFileSizeValid(finalSize)) {
      setState(prev => ({
        ...prev,
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_SMART_WEARABLE_FILE_SIZE)}MB`,
          type: `smart wearable`
        })
      }))
      return false
    }

    if (isRequirementMet && !isSkin && !isSmartWearable && finalSize && !isWearableFileSizeValid(finalSize)) {
      setState(prev => ({
        ...prev,
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_WEARABLE_FILE_SIZE)}MB`,
          type: `wearable`
        })
      }))
      return false
    }
    return isRequirementMet
  }, [collection, state, isThirdPartyV2Enabled])

  const handleSubmit = useCallback(async () => {
    const { id } = state

    let changeItemFile = false
    let addRepresentation = false
    let pristineItem: Item | null = null

    if (metadata) {
      changeItemFile = metadata.changeItemFile
      addRepresentation = metadata.addRepresentation
      pristineItem = metadata.item
    }

    if (id && isValid()) {
      const { thumbnail, contents, bodyShape, type, model, isRepresentation, item: editedItem, video } = state as StateData
      if (state.view === CreateItemView.DETAILS) {
        try {
          const blob = dataURLToBlob(thumbnail)
          const hasCustomThumbnail = THUMBNAIL_PATH in contents
          if (blob && !hasCustomThumbnail) {
            contents[THUMBNAIL_PATH] = blob
          }

          if (video) {
            const videoBlob = dataURLToBlob(video)
            const hasPreviewVideo = VIDEO_PATH in contents
            if (videoBlob && !hasPreviewVideo) {
              contents[VIDEO_PATH] = videoBlob
            }
          }

          const sortedContents =
            type === ItemType.WEARABLE && getBodyShapeTypeFromContents(contents) === BodyShapeType.BOTH
              ? sortContentZipBothBodyShape(bodyShape, contents)
              : sortContent(bodyShape, contents)
          const representations =
            type === ItemType.WEARABLE && getBodyShapeTypeFromContents(contents) === BodyShapeType.BOTH
              ? buildRepresentationsZipBothBodyshape(bodyShape, sortedContents)
              : buildRepresentations(bodyShape, model, sortedContents)

          // Add this item as a representation of an existing item
          if ((isRepresentation || addRepresentation) && editedItem) {
            await addItemRepresentation(sortedContents, representations)
          } else if (pristineItem && changeItemFile) {
            await modifyItem(pristineItem, sortedContents, representations)
          } else {
            await createItem(sortedContents, representations)
          }
        } catch (error) {
          setState(prev => ({ ...prev, error: isErrorWithMessage(error) ? error.message : 'Unknown error' }))
        }
      } else if (!!state.item && !!state.itemSortedContents) {
        const sortedContents = {
          male: state.itemSortedContents,
          female: state.itemSortedContents,
          all: state.itemSortedContents
        }
        const representations = buildRepresentations(state.bodyShape!, state.model!, sortedContents)
        await createItem(sortedContents, representations)
      }
    }
  }, [metadata, state, addItemRepresentation, createItem, modifyItem, setState, isValid])

  const getMetricsAndScreenshot = useCallback(async () => {
    const { type, previewController, model, contents, category, thumbnail } = state
    if (type && model && contents) {
      const data = await getItemData({
        wearablePreviewController: previewController,
        type,
        model,
        contents,
        category
      })
      setState(prev => {
        let view = CreateItemView.DETAILS
        if (isSmart({ type, contents })) {
          // TODO: await setTimeout(() => {}, ITEM_LOADED_CHECK_DELAY)
          view = CreateItemView.UPLOAD_VIDEO
        }
        return { ...prev, metrics: data.info, thumbnail: thumbnail ?? data.image, view, isLoading: false }
      })
    }
  }, [state, setState])

  const handleDropAccepted = useCallback(
    (acceptedFileProps: AcceptedFileProps) => {
      const { bodyShape, ...acceptedProps } = acceptedFileProps
      setState(prev => ({
        ...prev,
        isLoading: true,
        bodyShape: bodyShape || prev.bodyShape,
        ...acceptedProps
      }))
    },
    [setState]
  )

  const handleVideoDropAccepted = useCallback(
    (acceptedFileProps: AcceptedFileProps) => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        ...acceptedFileProps
      }))
    },
    [setState]
  )

  const handleSaveVideo = useCallback(() => {
    setState({
      fromView: undefined,
      isLoading: false,
      view: CreateItemView.DETAILS
    })
  }, [setState])

  const getMapping = useCallback((): Mapping => {
    const { mappings } = state
    const contract = getLinkedContract(collection)
    if (!contract) {
      return defaultMapping
    }

    let mapping: Mapping | undefined
    if (mappings) {
      mapping = mappings[contract.network]?.[contract.address][0]
    } else {
      mapping = getDefaultMappings(contract, isThirdPartyV2Enabled)?.[contract.network]?.[contract.address][0]
    }

    return mapping ?? defaultMapping
  }, [collection, state, isThirdPartyV2Enabled])

  const handleMappingChange = useCallback(
    (mapping: Mapping) => {
      const contract = getLinkedContract(collection)
      if (!contract) {
        return
      }

      setState(prev => ({
        ...prev,
        mappings: buildItemMappings(mapping, contract)
      }))
    },
    [collection, setState]
  )

  const handleNameChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) =>
      setState(prev => ({ ...prev, name: props.value.slice(0, ITEM_NAME_MAX_LENGTH) })),
    [setState]
  )

  const handleItemChange = useCallback(
    (item: Item) => {
      setState(prev => ({ ...prev, item: item, category: item.data.category, rarity: item.rarity }))
    },
    [setState]
  )

  const handleCategoryChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      const category = value as WearableCategory
      const hasChangedThumbnailType =
        (state.category && getThumbnailType(category) !== getThumbnailType(state.category as WearableCategory)) || !state.category

      if (state.category !== category) {
        setState(prev => ({ ...prev, category }))
        if (state.type === ItemType.WEARABLE && hasChangedThumbnailType) {
          // As it's not required to wait for the promise, use the void operator to return undefined
          void updateThumbnailByCategory(category)
        }
      }
    },
    [state, setState]
  )

  const handleRarityChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      const rarity = value as Rarity
      setState(prev => ({ ...prev, rarity }))
    },
    [setState]
  )

  const handlePlayModeChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      const playMode = value as EmotePlayMode
      setState(prev => ({ ...prev, playMode }))
    },
    [setState]
  )

  const handleOpenThumbnailDialog = useCallback(() => {
    const { type } = state
    if (type === ItemType.EMOTE) {
      setState(prev => ({ ...prev, fromView: CreateItemView.DETAILS, view: CreateItemView.THUMBNAIL }))
    } else if (thumbnailInput.current) {
      thumbnailInput.current.click()
    }
  }, [state, thumbnailInput, setState])

  const handleThumbnailChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { contents } = state
      const { files } = event.target
      if (files && files.length > 0) {
        const file = files[0]
        const imageType = await getImageType(file)
        if (imageType !== ImageType.PNG) {
          setState(prev => ({ ...prev, error: t('create_single_item_modal.wrong_thumbnail_format') }))
          return
        }
        setState(prev => ({ ...prev, error: undefined }))

        const smallThumbnailBlob = await resizeImage(file)
        const bigThumbnailBlob = await resizeImage(file, 1024, 1024)

        const thumbnail = URL.createObjectURL(smallThumbnailBlob)

        setState(prev => ({
          ...prev,
          thumbnail,
          contents: {
            ...contents,
            [THUMBNAIL_PATH]: bigThumbnailBlob
          }
        }))
      }
    },
    [state, setState]
  )

  const handleOpenVideoDialog = useCallback(() => {
    setState(prev => ({ ...prev, view: CreateItemView.UPLOAD_VIDEO, fromView: CreateItemView.DETAILS }))
  }, [setState])

  const handleYes = useCallback(() => setState(prev => ({ ...prev, isRepresentation: true })), [setState])

  const handleNo = useCallback(() => setState(prev => ({ ...prev, isRepresentation: false })), [setState])

  const isAddingRepresentation = useMemo<boolean>(() => {
    return !!(metadata && metadata.item && !metadata.changeItemFile)
  }, [metadata])

  const filterItemsByBodyShape = useCallback(
    (item: Item) => {
      const { bodyShape } = state
      return getMissingBodyShapeType(item) === bodyShape && metadata.collectionId === item.collectionId
    },
    [metadata, state]
  )

  /**
   * Updates the item's thumbnail if the user changes the category of the item.
   *
   * @param category - The category of the wearable.
   */
  const updateThumbnailByCategory = useCallback(
    async (category: WearableCategory) => {
      const { model, contents } = state

      const isCustom = !!contents && THUMBNAIL_PATH in contents
      if (!isCustom) {
        setState(prev => ({ ...prev, isLoading: true }))
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
        setState(prev => ({ ...prev, thumbnail, isLoading: false }))
      }
    },
    [state, setState]
  )

  const renderModalTitle = useCallback(() => {
    const { bodyShape, type, view, contents } = state

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

    if (isSmart({ type, contents }) && view === CreateItemView.DETAILS) {
      return t('create_single_item_modal.smart_wearable_details_title')
    }

    switch (view) {
      case CreateItemView.THUMBNAIL:
        return t('create_single_item_modal.thumbnail_step_title')
      case CreateItemView.UPLOAD_VIDEO:
        return t('create_single_item_modal.upload_video_step_title')
      default:
        return t('create_single_item_modal.title')
    }
  }, [metadata, state, isAddingRepresentation])

  const handleFileLoad = useCallback(async () => {
    const { weareblePreviewUpdated, type, model, item, contents } = state

    const modelSize = await calculateModelFinalSize(
      item?.contents ?? {},
      contents ?? {},
      type ?? ItemType.WEARABLE,
      new BuilderAPI(BUILDER_SERVER_URL, new Authorization(() => props.address))
    )

    setState(prev => ({ ...prev, modelSize }))

    // if model is an image, the wearable preview won't be needed
    if (model && isImageFile(model)) {
      return getMetricsAndScreenshot()
    }

    const controller = WearablePreview.createController('thumbnail-picker')
    setState(prev => ({ ...prev, previewController: controller }))

    if (weareblePreviewUpdated) {
      if (type === ItemType.EMOTE) {
        const length = await controller.emote.getLength()
        await controller.emote.goTo(Math.floor(Math.random() * length))
      }
      return getMetricsAndScreenshot()
    }
  }, [state, getMetricsAndScreenshot, setState])

  const renderWearablePreview = useCallback(() => {
    const { type, contents } = state
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
        onUpdate={() => setState(prev => ({ ...prev, weareblePreviewUpdated: true }))}
        onLoad={handleFileLoad}
      />
    )
  }, [state, handleFileLoad])

  const handleUploadVideoGoBack = useCallback(() => {
    const { fromView } = state
    const keys = Object.keys(state)

    if (fromView) {
      setState(prev => ({ ...prev, view: fromView }))
      return
    }

    const stateReset = keys.reduce((acc, v) => ({ ...acc, [v]: undefined }), {})
    setState(prev => ({ ...prev, ...stateReset, ...getInitialState() }))
  }, [state, setState])

  const renderImportView = useCallback(() => {
    const { category, isLoading, isRepresentation } = state
    const title = renderModalTitle()

    return (
      <ImportStep
        collection={collection}
        category={category as WearableCategory | EmoteCategory}
        metadata={metadata}
        title={title}
        wearablePreviewComponent={<div className="importer-thumbnail-container">{renderWearablePreview()}</div>}
        isLoading={!!isLoading}
        isRepresentation={!!isRepresentation}
        onDropAccepted={handleDropAccepted}
        onClose={onClose}
      />
    )
  }, [collection, metadata, state, handleDropAccepted, renderModalTitle, renderWearablePreview, onClose])

  const renderUploadVideoView = useCallback(() => {
    const { contents } = state
    const title = renderModalTitle()

    return (
      <UploadVideoStep
        title={title}
        contents={contents}
        onDropAccepted={handleVideoDropAccepted}
        onBack={handleUploadVideoGoBack}
        onClose={onClose}
        onSaveVideo={handleSaveVideo}
        required={!!itemStatus}
      />
    )
  }, [itemStatus, state, renderModalTitle, handleVideoDropAccepted, handleSaveVideo, handleUploadVideoGoBack, onClose])

  const renderFields = useCallback(() => {
    const { name, category, rarity, contents, item, type, isLoading } = state

    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const rarities = Rarity.getRarities()
    const categories: string[] = type === ItemType.WEARABLE ? getWearableCategories(contents) : getEmoteCategories()
    const linkedContract = getLinkedContract(collection)

    const raritiesLink =
      'https://docs.decentraland.org/creator/wearables-and-emotes/manage-collections' +
      (type === ItemType.EMOTE
        ? '/uploading-emotes/#rarity'
        : isSmart({ type, contents })
        ? '/uploading-smart-wearables/#rarity'
        : '/uploading-wearables/#rarity')

    return (
      <>
        <Field
          className="name"
          label={t('create_single_item_modal.name_label')}
          value={name}
          disabled={isLoading}
          onChange={handleNameChange}
        />
        {(!item || !item.isPublished) && !belongsToAThirdPartyCollection ? (
          <>
            <SelectField
              label={
                <div className="field-header">
                  {t('create_single_item_modal.rarity_label')}
                  <a href={raritiesLink} target="_blank" rel="noopener noreferrer" className="learn-more">
                    {t('global.learn_more')}
                  </a>
                </div>
              }
              placeholder={t('create_single_item_modal.rarity_placeholder')}
              value={rarity}
              options={rarities.map(value => ({
                value,
                label: t('wearable.supply', {
                  count: Rarity.getMaxSupply(value),
                  formatted: Rarity.getMaxSupply(value).toLocaleString()
                }),
                text: t(`wearable.rarity.${value}`)
              }))}
              disabled={isLoading}
              onChange={handleRarityChange}
            />
          </>
        ) : null}
        <SelectField
          required
          disabled={isLoading}
          label={t('create_single_item_modal.category_label')}
          placeholder={t('create_single_item_modal.category_placeholder')}
          value={categories.includes(category!) ? category : undefined}
          options={categories.map(value => ({ value, text: t(`${type!}.category.${value}`) }))}
          onChange={handleCategoryChange}
        />
        {isThirdPartyV2Enabled && linkedContract && <MappingEditor onChange={handleMappingChange} mapping={getMapping()} />}
      </>
    )
  }, [collection, getMapping, handleCategoryChange, handleMappingChange, handleNameChange, handleRarityChange, isThirdPartyV2Enabled])

  const renderMetrics = useCallback(() => {
    const { metrics, contents } = state
    if (metrics) {
      return <ItemProperties item={{ metrics, contents } as unknown as Item} />
    } else {
      return null
    }
  }, [state])

  const isDisabled = useCallback((): boolean => {
    const { isLoading: isStateLoading } = state

    return !isValid() || isLoading || Boolean(isStateLoading)
  }, [state, isLoading, isValid])

  const renderRepresentation = useCallback(
    (type: BodyShapeType) => {
      const { bodyShape } = state
      return (
        <div
          className={`option has-icon ${type} ${type === bodyShape ? 'active' : ''}`.trim()}
          onClick={() =>
            setState(prev => ({
              ...prev,
              bodyShape: type,
              isRepresentation: metadata && metadata.changeItemFile ? false : undefined,
              item: undefined
            }))
          }
        >
          {t('body_shapes.' + type)}
        </div>
      )
    },
    [metadata, state, setState]
  )

  const renderWearableDetails = useCallback(() => {
    const { bodyShape, thumbnail, isRepresentation, rarity, item } = state
    const title = renderModalTitle()
    const thumbnailStyle = getBackgroundStyle(rarity)

    return (
      <>
        <div className="preview">
          <div className="thumbnail-container">
            <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
            {isRepresentation ? null : (
              <>
                <Icon name="camera" onClick={handleOpenThumbnailDialog} />
                <input type="file" ref={thumbnailInput} onChange={handleThumbnailChange} accept="image/png" />
              </>
            )}
          </div>
          {renderMetrics()}
        </div>
        <Column className="data" grow={true}>
          {isAddingRepresentation ? null : (
            <Section>
              <Header sub>{t('create_single_item_modal.representation_label')}</Header>
              <Row>
                {renderRepresentation(BodyShapeType.BOTH)}
                {renderRepresentation(BodyShapeType.MALE)}
                {renderRepresentation(BodyShapeType.FEMALE)}
              </Row>
            </Section>
          )}
          {bodyShape && (!metadata || !metadata.changeItemFile) ? (
            <>
              {bodyShape === BodyShapeType.BOTH ? (
                renderFields()
              ) : (
                <>
                  {isAddingRepresentation ? null : (
                    <Section>
                      <Header sub>{t('create_single_item_modal.existing_item')}</Header>
                      <Row>
                        <div className={`option ${isRepresentation === true ? 'active' : ''}`} onClick={handleYes}>
                          {t('global.yes')}
                        </div>
                        <div className={`option ${isRepresentation === false ? 'active' : ''}`} onClick={handleNo}>
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
                        value={item as Item<ItemType.WEARABLE>}
                        filter={filterItemsByBodyShape}
                        onChange={handleItemChange}
                        isDisabled={isAddingRepresentation}
                      />
                    </Section>
                  ) : (
                    renderFields()
                  )}
                </>
              )}
            </>
          ) : (
            renderFields()
          )}
        </Column>
      </>
    )
  }, [metadata, state, renderFields, renderMetrics, renderModalTitle, renderRepresentation, isAddingRepresentation])

  const renderEmoteDetails = useCallback(() => {
    const { thumbnail, rarity, playMode = '' } = state
    const title = renderModalTitle()
    const thumbnailStyle = getBackgroundStyle(rarity)

    return (
      <Column>
        <Row>
          <Column className="preview" width={192} grow={false}>
            <div className="thumbnail-container">
              <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
              <Icon name="camera" onClick={handleOpenThumbnailDialog} />
              <input type="file" ref={thumbnailInput} onChange={handleThumbnailChange} accept="image/png" />
            </div>
            {renderMetrics()}
          </Column>
          <Column className="data" grow={true}>
            {renderFields()}
            <SelectField
              required
              search={false}
              className="has-description"
              label={t('create_single_item_modal.play_mode_label')}
              placeholder={t('create_single_item_modal.play_mode_placeholder')}
              value={playMode as EmotePlayMode}
              options={getPlayModeOptions()}
              onChange={handlePlayModeChange}
            />
          </Column>
        </Row>
        <div className="notice">
          <Message info visible content={t('create_single_item_modal.emote_notice')} icon={<Icon name="alert" />} />
        </div>
      </Column>
    )
  }, [state, renderFields, renderMetrics, renderModalTitle, handlePlayModeChange, handleThumbnailChange])

  const renderSmartWearableDetails = useCallback(() => {
    const { thumbnail, rarity, requiredPermissions, video } = state
    const title = renderModalTitle()
    const thumbnailStyle = getBackgroundStyle(rarity)

    return (
      <div className="data smart-wearable">
        {renderFields()}
        {requiredPermissions?.length ? (
          <div className="required-permissions">
            <Header sub className="field-header">
              {t('create_single_item_modal.smart_wearable_permissions_label')}
              <a
                href="https://docs.decentraland.org/creator/development-guide/sdk7/scene-metadata/#required-permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="learn-more"
              >
                {t('global.learn_more')}
              </a>
            </Header>
            <ItemRequiredPermission requiredPermissions={requiredPermissions} basic />
          </div>
        ) : null}
        <Row className="previews">
          <div className="thumbnail-preview-container">
            <Header sub>{t('create_single_item_modal.thumbnail_preview_title')}</Header>
            <div className="preview">
              <div className="thumbnail-container">
                <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
                <Icon name="camera" onClick={handleOpenThumbnailDialog} />
                <input type="file" ref={thumbnailInput} onChange={handleThumbnailChange} accept="image/png" />
              </div>
              <div className="thumbnail-metrics">{renderMetrics()}</div>
            </div>
          </div>

          <div className="video-preview-container">
            <Header sub>{t('create_single_item_modal.video_preview_title')}</Header>
            <div className="preview">
              <ItemVideo
                src={video}
                showMetrics
                previewIcon={<DCLIcon name="video" onClick={handleOpenVideoDialog} />}
                onClick={handleOpenVideoDialog}
              />
            </div>
          </div>
        </Row>
        <div className="notice">
          <Message info visible content={t('create_single_item_modal.smart_wearable_notice')} icon={<Icon name="alert" />} />
        </div>
      </div>
    )
  }, [state, renderFields, renderMetrics, renderModalTitle, handleOpenVideoDialog])

  const renderItemDetails = useCallback(() => {
    const { type, contents } = state

    if (type === ItemType.EMOTE) {
      return renderEmoteDetails()
    } else if (isSmart({ type, contents })) {
      return renderSmartWearableDetails()
    } else {
      return renderWearableDetails()
    }
  }, [state, renderEmoteDetails, renderSmartWearableDetails, renderWearableDetails])

  const handleGoBack = useCallback(() => {
    setState({ view: CreateItemView.UPLOAD_VIDEO })
  }, [setState])

  const renderDetailsView = useCallback(() => {
    const { isRepresentation, error: stateError, type, contents, isLoading: isStateLoading, hasScreenshotTaken } = state
    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const _isDisabled = isDisabled()
    const title = renderModalTitle()
    const hasFinishSteps = (type === ItemType.EMOTE && hasScreenshotTaken) || type === ItemType.WEARABLE

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <Form onSubmit={handleSubmit} disabled={_isDisabled}>
            <Column>
              <Row className="details">{renderItemDetails()}</Row>
              <Row className="actions" grow>
                {isSmart({ type, contents }) ? (
                  <Column grow shrink>
                    <Button disabled={_isDisabled} onClick={handleGoBack}>
                      {t('global.back')}
                    </Button>
                  </Column>
                ) : null}
                <Column align="right">
                  <Button primary disabled={_isDisabled} loading={isLoading || isStateLoading}>
                    {(metadata && metadata.changeItemFile) || isRepresentation || belongsToAThirdPartyCollection || hasFinishSteps
                      ? t('global.save')
                      : t('global.next')}
                  </Button>
                </Column>
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
  }, [collection, error, metadata, state, handleSubmit, renderModalTitle, setState, isDisabled, isLoading, onClose])

  const handleOnScreenshotTaken = useCallback(
    async (screenshot: string) => {
      const { itemSortedContents, item } = state

      if (item && itemSortedContents) {
        const blob = dataURLToBlob(screenshot)

        itemSortedContents[THUMBNAIL_PATH] = blob!
        item.contents = await computeHashes(itemSortedContents)

        setState(prev => {
          let view = prev.view

          if (prev.fromView === CreateItemView.DETAILS) {
            view = CreateItemView.DETAILS
          } else {
            void handleSubmit()
          }

          return { ...prev, itemSortedContents, item, hasScreenshotTaken: true, view }
        })
      } else {
        setState(prev => {
          let view = prev.view

          if (prev.fromView === CreateItemView.DETAILS) {
            view = CreateItemView.DETAILS
          }

          return { ...prev, thumbnail: screenshot, hasScreenshotTaken: true, view }
        })
      }
    },
    [state, setState]
  )

  const renderThumbnailView = useCallback(() => {
    const { isLoading, contents } = state

    return (
      <EditThumbnailStep
        isLoading={!!isLoading}
        blob={contents ? toEmoteWithBlobs({ contents }) : undefined}
        title={renderModalTitle()}
        onBack={() => setState({ view: CreateItemView.DETAILS })}
        onSave={handleOnScreenshotTaken}
        onClose={onClose}
      />
    )
  }, [state, renderModalTitle, handleOnScreenshotTaken, onClose])

  const renderSetPrice = useCallback(() => {
    const { item, itemSortedContents } = state
    return (
      <EditPriceAndBeneficiaryModal
        name={'EditPriceAndBeneficiaryModal'}
        metadata={{ itemId: item!.id }}
        item={item!}
        itemSortedContents={itemSortedContents}
        onClose={onClose}
        mountNode={modalContainer.current ?? undefined}
        // If the Set Price step is skipped, the item must be saved
        onSkip={handleSubmit}
      />
    )
  }, [state, handleSubmit])

  const renderView = useCallback(() => {
    const { view } = state
    switch (view) {
      case CreateItemView.IMPORT:
        return renderImportView()
      case CreateItemView.UPLOAD_VIDEO:
        return renderUploadVideoView()
      case CreateItemView.DETAILS:
        return renderDetailsView()
      case CreateItemView.THUMBNAIL:
        return renderThumbnailView()
      case CreateItemView.SET_PRICE:
        return renderSetPrice()
      default:
        return null
    }
  }, [state])

  return (
    <div ref={modalContainer} className="CreateSingleItemModalContainer">
      <Modal name={name} onClose={onClose} mountNode={modalContainer.current ?? undefined}>
        {renderView()}
      </Modal>
    </div>
  )
}

export default React.memo(CreateSingleItemModal)
