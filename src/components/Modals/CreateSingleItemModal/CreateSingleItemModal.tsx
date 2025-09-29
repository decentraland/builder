import React, { useReducer, useRef, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import {
  BodyPartCategory,
  BodyShape,
  EmoteCategory,
  Rarity,
  PreviewProjection,
  WearableCategory,
  IPreviewController,
  EmoteDataADR287,
  StartAnimation
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
import { getImageType, dataURLToBlob } from 'modules/media/utils'
import { ImageType } from 'modules/media/types'
import {
  THUMBNAIL_PATH,
  Item,
  BodyShapeType,
  WearableRepresentation,
  ItemType,
  EmotePlayMode,
  VIDEO_PATH,
  WearableData,
  SyncStatus,
  EmoteData
} from 'modules/item/types'
import { areEmoteMetrics, Metrics } from 'modules/models/types'
import { computeHashes } from 'modules/deployment/contentUtils'
import {
  getBodyShapeType,
  getMissingBodyShapeType,
  isImageFile,
  resizeImage,
  getBodyShapeTypeFromContents,
  isSmart,
  isWearable,
  isEmoteFileSizeValid,
  isSkinFileSizeValid,
  isSmartWearableFileSizeValid,
  isWearableFileSizeValid
} from 'modules/item/utils'
import { getItemData } from 'lib/getModelData'
import { toMB } from 'lib/file'
import {
  getDefaultThirdPartyUrnSuffix,
  buildThirdPartyURN,
  DecodedURN,
  decodeURN,
  isThirdParty,
  isThirdPartyCollectionDecodedUrn
} from 'lib/urn'
import ItemProperties from 'components/ItemProperties'
import { calculateFileSize, calculateModelFinalSize } from 'modules/item/export'
import { MAX_THUMBNAIL_SIZE } from 'modules/assetPack/utils'
import { areMappingsValid } from 'modules/thirdParty/utils'
import { Authorization } from 'lib/api/auth'
import { BUILDER_SERVER_URL, BuilderAPI } from 'lib/api/builder'
import {
  autocompleteEmoteData,
  buildRepresentations,
  buildRepresentationsZipBothBodyshape,
  getLinkedContract,
  sortContent,
  sortContentZipBothBodyShape,
  toEmoteWithBlobs,
  toWearableWithBlobs
} from './utils'
import { createItemReducer, createItemActions, createInitialState } from './CreateSingleItemModal.reducer'
import {
  Props,
  State,
  CreateItemView,
  StateData,
  SortedContent,
  AcceptedFileProps,
  CreateSingleItemModalMetadata
} from './CreateSingleItemModal.types'
import { Steps } from './Steps'
import { CreateSingleItemModalProvider } from './CreateSingleItemModalProvider'
import './CreateSingleItemModal.css'

export const CreateSingleItemModal: React.FC<Props> = props => {
  const { address, collection, error, itemStatus, metadata, name, onClose, onSave, isLoading, isThirdPartyV2Enabled } = props
  const thumbnailInput = useRef<HTMLInputElement>(null)
  const modalContainer = useRef<HTMLDivElement>(null)

  const getInitialState = useCallback((): State => {
    return createInitialState(metadata, collection, isThirdPartyV2Enabled)
  }, [collection, metadata, isThirdPartyV2Enabled])

  const [state, dispatch] = useReducer(createItemReducer, getInitialState())

  const isAddingRepresentation = useMemo(() => {
    return !!(metadata && metadata.item && !metadata.changeItemFile)
  }, [metadata])

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
        mappings,
        emoteData
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
      let data: WearableData | EmoteData

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
        } as EmoteData

        // ADR 287 - Social Emotes
        // Use autocompleteEmoteData to generate startAnimation and outcomes from available animations
        if (emoteData?.animations && emoteData.animations.length > 0) {
          const animationNames = emoteData.animations.map(clip => clip.name)
          const autocompletedData = autocompleteEmoteData(animationNames)

          if (autocompletedData.startAnimation || autocompletedData.outcomes) {
            const socialEmoteData: Partial<EmoteDataADR287> = {}

            // Transform startAnimation if available
            if (autocompletedData.startAnimation) {
              socialEmoteData.startAnimation = autocompletedData.startAnimation as StartAnimation
            }

            // Transform outcomes if available
            if (autocompletedData.outcomes) {
              socialEmoteData.outcomes = autocompletedData.outcomes
            }

            // Add randomizeOutcomes flag
            socialEmoteData.randomizeOutcomes = false

            data = {
              ...data,
              ...socialEmoteData
            }
          }
        }
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

      dispatch(createItemActions.setItem(item as Item))
      dispatch(createItemActions.setItemSortedContents(sortedContents.all))
      dispatch(createItemActions.setView(CreateItemView.THUMBNAIL))
      dispatch(createItemActions.setFromView(CreateItemView.THUMBNAIL))
    },
    [address, collection, state, onSave]
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
      const { name, bodyShape, type, mappings, metrics, category, playMode, requiredPermissions, outcomes } = state as StateData

      let data: WearableData | EmoteData

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
        } as EmoteData

        // ADR 287 - Social Emotes
        if (outcomes && outcomes.length > 0) {
          ;(data as EmoteDataADR287).outcomes = outcomes
        }
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

  // Thumbnail handling
  const handleOpenThumbnailDialog = useCallback(() => {
    const { type } = state
    if (type === ItemType.EMOTE) {
      dispatch(createItemActions.setView(CreateItemView.THUMBNAIL))
    } else if (thumbnailInput.current) {
      thumbnailInput.current.click()
    }
  }, [state, thumbnailInput])

  const handleThumbnailChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { contents } = state
      const { files } = event.target
      if (files && files.length > 0) {
        const file = files[0]
        const imageType = await getImageType(file)
        if (imageType !== ImageType.PNG) {
          dispatch(createItemActions.setError(t('create_single_item_modal.wrong_thumbnail_format')))
          return
        }
        dispatch(createItemActions.clearError())

        const smallThumbnailBlob = await resizeImage(file)
        const bigThumbnailBlob = await resizeImage(file, 1024, 1024)

        const thumbnail = URL.createObjectURL(smallThumbnailBlob)

        dispatch(createItemActions.setThumbnail(thumbnail))
        dispatch(
          createItemActions.setContents({
            ...contents,
            [THUMBNAIL_PATH]: bigThumbnailBlob
          })
        )
      }
    },
    [state]
  )

  const handleItemChange = useCallback((item: Item) => {
    dispatch(createItemActions.setItem(item))
    dispatch(createItemActions.setCategory(item.data.category as WearableCategory))
    dispatch(createItemActions.setRarity(item.rarity as Rarity))
  }, [])

  const filterItemsByBodyShape = useCallback(
    (item: Item) => {
      const { bodyShape } = state
      return getMissingBodyShapeType(item) === bodyShape && metadata.collectionId === item.collectionId
    },
    [metadata, state]
  )

  // Common render functions
  const renderMetrics = useCallback(() => {
    const { metrics, contents } = state
    if (metrics) {
      return <ItemProperties item={{ metrics, contents } as unknown as Item} />
    } else {
      return null
    }
  }, [state])

  /**
   * Gets the modal title based on state and metadata
   */
  const getModalTitle = (state: State, metadata: CreateSingleItemModalMetadata, isAddingRepresentation: boolean): string => {
    const { type, view, contents } = state

    if (isAddingRepresentation) {
      return t('create_single_item_modal.add_representation')
    }

    if (metadata && metadata.changeItemFile) {
      return t('create_single_item_modal.change_item_file')
    }

    if (type === ItemType.EMOTE) {
      return view === CreateItemView.THUMBNAIL
        ? t('create_single_item_modal.thumbnail_step_title')
        : t('create_single_item_modal.title_emote')
    }

    if (type === ItemType.WEARABLE && contents && isSmart({ type, contents }) && view === CreateItemView.DETAILS) {
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
  }

  const renderModalTitle = useCallback(() => {
    return getModalTitle(state, metadata, isAddingRepresentation)
  }, [state, metadata, isAddingRepresentation])

  // Validation
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
      dispatch(createItemActions.clearError())
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
      dispatch(
        createItemActions.setError(
          t('create_single_item_modal.error.thumbnail_file_too_big', { maxSize: `${toMB(MAX_THUMBNAIL_FILE_SIZE)}MB` })
        )
      )
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
      dispatch(
        createItemActions.setError(
          t('create_single_item_modal.error.item_too_big', {
            size: `${toMB(MAX_EMOTE_FILE_SIZE)}MB`,
            type: `emote`
          })
        )
      )
      return false
    }

    if (isRequirementMet && isSkin && finalSize && !isSkinFileSizeValid(finalSize)) {
      dispatch(
        createItemActions.setError(
          t('create_single_item_modal.error.item_too_big', {
            size: `${toMB(MAX_SKIN_FILE_SIZE)}MB`,
            type: `skin`
          })
        )
      )
      return false
    }

    if (isRequirementMet && !isSkin && isSmartWearable && finalSize && !isSmartWearableFileSizeValid(finalSize)) {
      console.log('isSmartWearableFileSizeValid', isSmartWearableFileSizeValid(finalSize), finalSize, toMB(MAX_SMART_WEARABLE_FILE_SIZE))
      dispatch(
        createItemActions.setError(
          t('create_single_item_modal.error.item_too_big', {
            size: `${toMB(MAX_SMART_WEARABLE_FILE_SIZE)}MB`,
            type: `smart wearable`
          })
        )
      )
      return false
    }

    if (isRequirementMet && !isSkin && !isSmartWearable && finalSize && !isWearableFileSizeValid(finalSize)) {
      dispatch(
        createItemActions.setError(
          t('create_single_item_modal.error.item_too_big', {
            size: `${toMB(MAX_WEARABLE_FILE_SIZE)}MB`,
            type: `wearable`
          })
        )
      )
      return false
    }
    return isRequirementMet
  }, [collection, state, isThirdPartyV2Enabled])

  const isDisabled = useCallback((): boolean => {
    const { isLoading: isStateLoading } = state
    return !isValid() || isLoading || Boolean(isStateLoading)
  }, [state, isLoading, isValid])

  // TODO: Refactor this logic to accept all the required parameters instead of using the reduer state as we need to wait for each render before properly call the submit
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
      const {
        thumbnail,
        contents,
        bodyShape,
        type,
        model,
        isRepresentation,
        item: editedItem,
        video,
        hasScreenshotTaken
      } = state as StateData
      if (state.view === CreateItemView.DETAILS) {
        if (type === ItemType.EMOTE && !hasScreenshotTaken) {
          dispatch(createItemActions.setFromView(CreateItemView.DETAILS))
          dispatch(createItemActions.setView(CreateItemView.THUMBNAIL))
          return
        }

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
          dispatch(createItemActions.setError(isErrorWithMessage(error) ? error.message : 'Unknown error'))
        }
      } else if (hasScreenshotTaken && type === ItemType.EMOTE && state.view === CreateItemView.THUMBNAIL) {
        try {
          const blob = dataURLToBlob(thumbnail)
          const hasCustomThumbnail = THUMBNAIL_PATH in contents
          if (blob && !hasCustomThumbnail) {
            contents[THUMBNAIL_PATH] = blob
          }

          const sortedContents = sortContent(bodyShape, contents)
          const representations = buildRepresentations(bodyShape, model, sortedContents)

          // Add this item as a representation of an existing item
          if (pristineItem && changeItemFile) {
            await modifyItem(pristineItem, sortedContents, representations)
          } else {
            await createItem(sortedContents, representations)
          }
        } catch (error) {
          dispatch(createItemActions.setError(isErrorWithMessage(error) ? error.message : 'Unknown error'))
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
  }, [metadata, state, addItemRepresentation, createItem, modifyItem, isValid])

  const handleDropAccepted = useCallback(
    (acceptedFileProps: AcceptedFileProps) => {
      const { bodyShape, ...acceptedProps } = acceptedFileProps
      dispatch(createItemActions.setLoading(true))
      dispatch(createItemActions.setBodyShape(bodyShape || state.bodyShape))
      dispatch(createItemActions.setAcceptedProps(acceptedProps))
    },
    [state]
  )

  const handleOnScreenshotTaken = useCallback(
    async (screenshot: string) => {
      const { itemSortedContents, item } = state

      if (item && itemSortedContents) {
        const blob = dataURLToBlob(screenshot)

        itemSortedContents[THUMBNAIL_PATH] = blob!
        item.contents = await computeHashes(itemSortedContents)

        // Update state with individual actions for clarity
        dispatch(createItemActions.setItemSortedContents(itemSortedContents))
        dispatch(createItemActions.setItem(item as Item))
      } else {
        // Update state with individual actions
        dispatch(createItemActions.setThumbnail(screenshot))
      }
      dispatch(createItemActions.setHasScreenshotTaken(true))
    },
    [state]
  )

  const getMetricsAndScreenshot = useCallback(
    async (controller?: IPreviewController) => {
      const { type, model, contents, category, thumbnail } = state
      if (type && model && contents && controller) {
        const data = await getItemData({
          wearablePreviewController: controller,
          type,
          model,
          contents,
          category
        })
        let view = CreateItemView.DETAILS
        if (isSmart({ type, contents })) {
          // TODO: await setTimeout(() => {}, ITEM_LOADED_CHECK_DELAY)
          view = CreateItemView.UPLOAD_VIDEO
        }

        dispatch(createItemActions.setMetrics(data.metrics))
        dispatch(createItemActions.setThumbnail(thumbnail ?? data.image))
        dispatch(createItemActions.setView(view))
        if (areEmoteMetrics(data.metrics) && data.metrics.additionalArmatures) {
          // required?
          dispatch(createItemActions.setEmoteData({ animations: data.animations ?? [], armatures: data.armatures! }))

          // Extract animation names from AnimationClip objects
          const animationNames = (data.animations ?? []).map(clip => clip.name)

          // Autocomplete emote data based on animation naming conventions
          const autocompletedData = autocompleteEmoteData(animationNames)

          if (autocompletedData.outcomes) {
            dispatch(createItemActions.setOutcomes(autocompletedData.outcomes))
          }
        }
        dispatch(createItemActions.setLoading(false))
      }
    },
    [state]
  )

  const handleFileLoad = useCallback(async () => {
    const { weareblePreviewUpdated, type, model, item, contents } = state

    const modelSize = await calculateModelFinalSize(
      item?.contents ?? {},
      contents ?? {},
      type ?? ItemType.WEARABLE,
      new BuilderAPI(BUILDER_SERVER_URL, new Authorization(() => props.address))
    )

    dispatch(createItemActions.setModelSize(modelSize))

    // if model is an image, the wearable preview won't be needed
    if (model && isImageFile(model)) {
      return getMetricsAndScreenshot()
    }

    const controller = WearablePreview.createController('thumbnail-picker')

    if (weareblePreviewUpdated) {
      if (type === ItemType.EMOTE) {
        const length = await controller.emote.getLength()
        await controller.emote.goTo(Math.floor(Math.random() * length))
      }
      return getMetricsAndScreenshot(controller)
    }
  }, [state, getMetricsAndScreenshot])

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
        blob={blob as any} // TODO: Remove any
        disableBackground
        disableAutoRotate
        projection={PreviewProjection.ORTHOGRAPHIC}
        {...wearablePreviewExtraOptions}
        onUpdate={() => dispatch(createItemActions.setWearablePreviewUpdated(true))}
        onLoad={handleFileLoad}
      />
    )
  }, [state, handleFileLoad])

  const contextValue = {
    // State
    state,
    dispatch,
    metadata,
    collection,
    isLoading,
    error,
    itemStatus,

    // Thumbnail handlers
    handleOpenThumbnailDialog,
    handleThumbnailChange,
    thumbnailInput,

    // Wearable-specific handlers
    filterItemsByBodyShape,
    handleItemChange,

    // File handling
    handleDropAccepted,
    handleOnScreenshotTaken,

    // Modal handlers
    onClose,
    handleSubmit,
    isDisabled,

    // Render functions
    renderMetrics,
    renderModalTitle,
    renderWearablePreview,

    // Flags
    isThirdPartyV2Enabled,
    isAddingRepresentation
  }

  return (
    <div ref={modalContainer} className="CreateSingleItemModalContainer">
      <Modal name={name} onClose={onClose} mountNode={modalContainer.current ?? undefined}>
        <CreateSingleItemModalProvider value={contextValue}>
          <Steps modalContainer={modalContainer} />
        </CreateSingleItemModalProvider>
      </Modal>
    </div>
  )
}

export default React.memo(CreateSingleItemModal)
