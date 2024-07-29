import * as React from 'react'
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
  Mappings,
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
  WearablePreview,
  Message
} from 'decentraland-ui'
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
  isWearable
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
import { calculateFileSize, calculateModelFinalSize } from 'modules/item/export'
import { MAX_THUMBNAIL_SIZE } from 'modules/assetPack/utils'
import { Authorization } from 'lib/api/auth'
import { MappingEditor } from 'components/MappingEditor/MappingEditor'
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
  AcceptedFileProps,
  ITEM_LOADED_CHECK_DELAY
} from './CreateSingleItemModal.types'
import './CreateSingleItemModal.css'
import { LinkedContract } from 'modules/thirdParty/types'

const defaultMapping: Mapping = { type: MappingType.ANY }
export default class CreateSingleItemModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()
  thumbnailInput = React.createRef<HTMLInputElement>()
  videoInput = React.createRef<HTMLInputElement>()
  modalContainer = React.createRef<HTMLDivElement>()
  timer: ReturnType<typeof setTimeout> | undefined

  getDefaultMappings(
    contract: LinkedContract | undefined,
    isThirdPartyV2Enabled: boolean
  ): Partial<Record<ContractNetwork, Record<ContractAddress, Mapping[]>>> | undefined {
    if (!isThirdPartyV2Enabled || !contract) {
      return undefined
    }

    return {
      [contract.network]: {
        [contract.address]: [defaultMapping]
      }
    }
  }

  getInitialState() {
    const { metadata, collection, isThirdPartyV2Enabled } = this.props

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
    const contract = collection ? this.getLinkedContract(collection) : undefined

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
      state.mappings = item.mappings ?? this.getDefaultMappings(contract, isThirdPartyV2Enabled)

      if (addRepresentation) {
        const missingBodyShape = getMissingBodyShapeType(item)
        if (missingBodyShape) {
          state.bodyShape = missingBodyShape
          state.isRepresentation = true
        }
      }
    } else {
      state.mappings = this.getDefaultMappings(contract, isThirdPartyV2Enabled)
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
      // Do not include the thumbnail, scenes, and video in each of the body shapes
      if ([THUMBNAIL_PATH, VIDEO_PATH].includes(key)) {
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

  sortContentZipBothBodyShape = (bodyShape: BodyShapeType, contents: Record<string, Blob>): SortedContent => {
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
      ...(bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.MALE ? this.prefixContents(BodyShapeType.MALE, both) : {})
    }

    female = {
      ...female,
      ...(bodyShape === BodyShapeType.BOTH || bodyShape === BodyShapeType.FEMALE ? this.prefixContents(BodyShapeType.FEMALE, both) : {})
    }

    const all = {
      [THUMBNAIL_PATH]: contents[THUMBNAIL_PATH],
      ...male,
      ...female
    }

    return { male, female, all }
  }

  createItem = async (sortedContents: SortedContent, representations: WearableRepresentation[]) => {
    const { address, collection, onSave } = this.props
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
    } = this.state as StateData

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
        blockVrmExport: blockVrmExport ?? false
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

    this.setState({
      item,
      itemSortedContents: sortedContents.all,
      view: hasScreenshotTaken || type !== ItemType.EMOTE ? CreateItemView.SET_PRICE : CreateItemView.THUMBNAIL,
      fromView: CreateItemView.THUMBNAIL
    })
  }

  addItemRepresentation = async (sortedContents: SortedContent, representations: WearableRepresentation[]) => {
    const { onSave } = this.props
    const { bodyShape, item: editedItem, requiredPermissions } = this.state as StateData
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
          blockVrmExport: editedItem.data.blockVrmExport
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
  }

  modifyItem = async (pristineItem: Item, sortedContents: SortedContent, representations: WearableRepresentation[]) => {
    const { itemStatus, onSave } = this.props
    const { name, bodyShape, type, metrics, category, playMode, requiredPermissions } = this.state as StateData

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
      const { thumbnail, contents, bodyShape, type, model, isRepresentation, item: editedItem, video } = this.state as StateData
      if (this.state.view === CreateItemView.DETAILS) {
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
          this.setState({ error: isErrorWithMessage(error) ? error.message : 'Unknown error' })
        }
      } else if (this.state.view === CreateItemView.SET_PRICE && !!this.state.item && !!this.state.itemSortedContents) {
        onSave(this.state.item as Item, this.state.itemSortedContents)
      }
    }
  }

  getMetricsAndScreenshot = async () => {
    const { type, previewController, model, contents, category, thumbnail } = this.state
    if (type && model && contents) {
      const data = await getItemData({
        wearablePreviewController: previewController,
        type,
        model,
        contents,
        category
      })
      this.setState({ metrics: data.info, thumbnail: thumbnail ?? data.image, isLoading: false }, () => {
        if (isSmart({ type, contents })) {
          this.timer = setTimeout(() => this.setState({ view: CreateItemView.UPLOAD_VIDEO }), ITEM_LOADED_CHECK_DELAY)
          return
        }

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

  handleVideoDropAccepted = (acceptedFileProps: AcceptedFileProps) => {
    this.setState({
      isLoading: true,
      ...acceptedFileProps
    })
  }

  handleSaveVideo = () => {
    this.setState({
      fromView: undefined,
      isLoading: false,
      view: CreateItemView.DETAILS
    })
  }

  areMappingsValid = (mappings: Mappings): boolean => {
    try {
      const validate = Mappings.validate(mappings)
      return !!validate
    } catch (error) {
      return false
    }
  }

  getLinkedContract(collection: Collection | undefined | null): LinkedContract | undefined {
    if (!collection?.linkedContractAddress || !collection?.linkedContractNetwork) {
      return undefined
    }

    return {
      address: collection.linkedContractAddress,
      network: collection.linkedContractNetwork
    }
  }

  getMapping = (): Mapping => {
    const { isThirdPartyV2Enabled, collection } = this.props
    const { mappings } = this.state
    const contract = this.getLinkedContract(collection)
    if (!contract) {
      return defaultMapping
    }

    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    let mapping: Mapping | undefined
    if (mappings) {
      mapping = mappings[contract.network]?.[contract.address][0]
    } else {
      mapping = this.getDefaultMappings(contract, isThirdPartyV2Enabled)?.[contract.network]?.[contract.address][0]
    }

    return mapping ?? defaultMapping
  }

  handleMappingChange = (mapping: Mapping) => {
    const { collection } = this.props
    const contract = this.getLinkedContract(collection)
    if (!contract) {
      return
    }

    this.setState({
      mappings: {
        [contract.network]: {
          [contract.address]: [mapping]
        }
      }
    })
  }

  handleOpenDocs = () => window.open('https://docs.decentraland.org/3d-modeling/3d-models/', '_blank')

  handleNameChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) =>
    this.setState({ name: props.value.slice(0, ITEM_NAME_MAX_LENGTH) })

  handleItemChange = (item: Item) => {
    this.setState({ item: item, category: item.data.category, rarity: item.rarity })
  }

  handleCategoryChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const category = value as WearableCategory
    const hasChangedThumbnailType =
      (this.state.category && getThumbnailType(category) !== getThumbnailType(this.state.category as WearableCategory)) ||
      !this.state.category

    if (this.state.category !== category) {
      this.setState({ category })
      if (this.state.type === ItemType.WEARABLE && hasChangedThumbnailType) {
        // As it's not required to wait for the promise, use the void operator to return undefined
        void this.updateThumbnailByCategory(category)
      }
    }
  }

  handleRarityChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const rarity = value as Rarity
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

  handleOpenVideoDialog = () => {
    this.setState({ view: CreateItemView.UPLOAD_VIDEO, fromView: CreateItemView.DETAILS })
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
      this.setState({ isLoading: true })
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
      this.setState({ thumbnail, isLoading: false })
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

  renderModalTitle = () => {
    const isAddingRepresentation = this.isAddingRepresentation()
    const { bodyShape, type, view, contents } = this.state
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
  }

  handleFileLoad = async () => {
    const { weareblePreviewUpdated, type, model, item, contents } = this.state

    const modelSize = await calculateModelFinalSize(
      item?.contents ?? {},
      contents ?? {},
      new BuilderAPI(BUILDER_SERVER_URL, new Authorization(() => this.props.address))
    )

    this.setState({ modelSize })

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

  handleUploadVideoGoBack = () => {
    const keys = Object.keys(this.state)
    const { fromView } = this.state

    if (fromView) {
      this.setState({ view: fromView })
      return
    }

    const stateReset = keys.reduce((acc, v) => ({ ...acc, [v]: undefined }), {})
    this.setState({ ...stateReset, ...this.getInitialState() })
  }

  renderImportView() {
    const { collection, metadata, onClose } = this.props
    const { category, isLoading, isRepresentation } = this.state
    const title = this.renderModalTitle()

    return (
      <ImportStep
        collection={collection}
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

  renderUploadVideoView() {
    const { itemStatus, onClose } = this.props
    const { contents } = this.state
    const title = this.renderModalTitle()

    return (
      <UploadVideoStep
        title={title}
        contents={contents}
        onDropAccepted={this.handleVideoDropAccepted}
        onBack={this.handleUploadVideoGoBack}
        onClose={onClose}
        onSaveVideo={this.handleSaveVideo}
        required={!!itemStatus}
      />
    )
  }

  renderFields() {
    const { collection, isThirdPartyV2Enabled } = this.props
    const { name, category, rarity, contents, item, type, isLoading } = this.state

    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const rarities = Rarity.getRarities()
    const categories: string[] = type === ItemType.WEARABLE ? getWearableCategories(contents) : getEmoteCategories()
    const linkedContract = this.getLinkedContract(collection)

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
          onChange={this.handleNameChange}
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
              onChange={this.handleRarityChange}
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
          onChange={this.handleCategoryChange}
        />
        {isThirdPartyV2Enabled && linkedContract && <MappingEditor onChange={this.handleMappingChange} mapping={this.getMapping()} />}
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

  renderMetrics() {
    const { metrics, contents } = this.state
    if (metrics) {
      return <ItemProperties item={{ metrics, contents } as unknown as Item} />
    } else {
      return null
    }
  }

  isDisabled(): boolean {
    const { isLoading } = this.props
    const { isLoading: isStateLoading } = this.state

    return !this.isValid() || isLoading || Boolean(isStateLoading)
  }

  isValid(): boolean {
    const { name, thumbnail, metrics, bodyShape, category, playMode, rarity, item, isRepresentation, type, modelSize, mappings } =
      this.state
    const { collection, isThirdPartyV2Enabled } = this.props
    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const linkedContract = collection ? this.getLinkedContract(collection) : undefined

    if (this.state.error) {
      this.setState({ error: undefined })
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
      this.setState({
        error: t('create_single_item_modal.error.thumbnail_file_too_big', { maxSize: `${toMB(MAX_THUMBNAIL_FILE_SIZE)}MB` })
      })
      return false
    }
    const isSkin = category === WearableCategory.SKIN
    const isEmote = type === ItemType.EMOTE
    const isSmartWearable = isSmart({ type, contents: this.state.contents })
    const isRequirementMet = required.every(prop => prop !== undefined)

    if (isThirdPartyV2Enabled && ((!mappings && linkedContract) || (mappings && !this.areMappingsValid(mappings)))) {
      return false
    }

    if (isRequirementMet && isEmote && modelSize && modelSize > MAX_EMOTE_FILE_SIZE) {
      this.setState({
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_EMOTE_FILE_SIZE)}MB`,
          type: `emote`
        })
      })
      return false
    }

    if (isRequirementMet && isSkin && modelSize && modelSize > MAX_SKIN_FILE_SIZE) {
      this.setState({
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_SKIN_FILE_SIZE)}MB`,
          type: `skin`
        })
      })
      return false
    }

    if (isRequirementMet && !isSkin && isSmartWearable && modelSize && modelSize > MAX_SMART_WEARABLE_FILE_SIZE) {
      this.setState({
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_SMART_WEARABLE_FILE_SIZE)}MB`,
          type: `smart wearable`
        })
      })
      return false
    }

    if (isRequirementMet && !isSkin && !isSmartWearable && modelSize && modelSize > MAX_WEARABLE_FILE_SIZE) {
      this.setState({
        error: t('create_single_item_modal.error.item_too_big', {
          size: `${toMB(MAX_WEARABLE_FILE_SIZE)}MB`,
          type: `wearable`
        })
      })
      return false
    }
    return isRequirementMet
  }

  renderWearableDetails() {
    const { metadata } = this.props
    const { bodyShape, thumbnail, isRepresentation, rarity, item } = this.state
    const title = this.renderModalTitle()
    const thumbnailStyle = getBackgroundStyle(rarity)
    const isAddingRepresentation = this.isAddingRepresentation()

    return (
      <>
        <div className="preview">
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
        </div>
        <Column className="data" grow={true}>
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
                        value={item as Item<ItemType.WEARABLE>}
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
        </Column>
      </>
    )
  }

  renderEmoteDetails() {
    const { thumbnail, rarity, playMode = '' } = this.state
    const title = this.renderModalTitle()
    const thumbnailStyle = getBackgroundStyle(rarity)

    return (
      <Column>
        <Row>
          <Column className="preview" width={192} grow={false}>
            <div className="thumbnail-container">
              <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
              <Icon name="camera" onClick={this.handleOpenThumbnailDialog} />
              <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnailChange} accept="image/png" />
            </div>
            {this.renderMetrics()}
          </Column>
          <Column className="data" grow={true}>
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
          </Column>
        </Row>
        <div className="notice">
          <Message info visible content={t('create_single_item_modal.emote_notice')} icon={<Icon name="alert" />} />
        </div>
      </Column>
    )
  }

  renderSmartWearableDetails() {
    const { thumbnail, rarity, requiredPermissions, video } = this.state
    const title = this.renderModalTitle()
    const thumbnailStyle = getBackgroundStyle(rarity)

    return (
      <div className="data smart-wearable">
        {this.renderFields()}
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
                <Icon name="camera" onClick={this.handleOpenThumbnailDialog} />
                <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnailChange} accept="image/png" />
              </div>
              <div className="thumbnail-metrics">{this.renderMetrics()}</div>
            </div>
          </div>

          <div className="video-preview-container">
            <Header sub>{t('create_single_item_modal.video_preview_title')}</Header>
            <div className="preview">
              <ItemVideo
                src={video}
                showMetrics
                previewIcon={<DCLIcon name="video" onClick={this.handleOpenVideoDialog} />}
                onClick={this.handleOpenVideoDialog}
              />
            </div>
          </div>
        </Row>
        <div className="notice">
          <Message info visible content={t('create_single_item_modal.smart_wearable_notice')} icon={<Icon name="alert" />} />
        </div>
      </div>
    )
  }

  renderItemDetails() {
    const { type, contents } = this.state

    if (type === ItemType.EMOTE) {
      return this.renderEmoteDetails()
    } else if (isSmart({ type, contents })) {
      return this.renderSmartWearableDetails()
    } else {
      return this.renderWearableDetails()
    }
  }

  handleGoBack = () => {
    this.setState({ view: CreateItemView.UPLOAD_VIDEO })
  }

  renderDetailsView() {
    const { onClose, metadata, error, isLoading, collection } = this.props
    const { isRepresentation, error: stateError, type, contents, isLoading: isStateLoading } = this.state
    const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
    const isDisabled = this.isDisabled()
    const title = this.renderModalTitle()

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          <Form onSubmit={this.handleSubmit} disabled={isDisabled}>
            <Column>
              <Row className="details">{this.renderItemDetails()}</Row>
              <Row className="actions" grow>
                {isSmart({ type, contents }) ? (
                  <Column grow shrink>
                    <Button disabled={isDisabled} onClick={this.handleGoBack}>
                      {t('global.back')}
                    </Button>
                  </Column>
                ) : null}
                <Column align="right">
                  <Button primary disabled={isDisabled} loading={isLoading || isStateLoading}>
                    {(metadata && metadata.changeItemFile) || isRepresentation || belongsToAThirdPartyCollection
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
      case CreateItemView.UPLOAD_VIDEO:
        return this.renderUploadVideoView()
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

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
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
