import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { IPreviewController, Rarity } from '@dcl/schemas'
import { Metrics } from 'modules/models/types'
import { Collection } from 'modules/collection/types'
import { saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { BodyShapeType, Item, ItemType, Mapping, SyncStatus } from 'modules/item/types'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details',
  THUMBNAIL = 'thumbnail',
  UPLOAD_VIDEO = 'upload_video',
  SET_PRICE = 'setPrice'
}

export const ITEM_LOADED_CHECK_DELAY = 2000

export type Props = ModalProps & {
  address?: string
  metadata: CreateSingleItemModalMetadata
  error: string | null
  isLoading: boolean
  collection: Collection | null
  itemStatus: SyncStatus | null
  onSave: typeof saveItemRequest
}

export type StateData = {
  id: string
  name: string
  description: string
  type: ItemType
  category: string
  playMode?: string
  rarity: Rarity
  bodyShape: BodyShapeType
  thumbnail: string
  model: string
  metrics: Metrics
  contents: Record<string, Blob>
  isRepresentation: boolean
  item: Item<ItemType.EMOTE | ItemType.WEARABLE>
  collectionId: string
  isLoading: boolean
  error: string
  file: File
  hasScreenshotTaken?: boolean
  previewController?: IPreviewController
  weareblePreviewUpdated: boolean
  video?: string
  requiredPermissions?: string[]
  tags?: string[]
  modelSize?: number
  mapping: Mapping
  blockVrmExport?: boolean
}
export type State = {
  view: CreateItemView
  fromView?: CreateItemView
  itemSortedContents?: Record<string, Blob>
} & Partial<StateData>

export type CreateSingleItemModalMetadata = {
  collectionId?: string
  item?: Item
  addRepresentation?: boolean
  changeItemFile?: boolean
}

export type ModelData = {
  type: ItemType
  model: string
  contents: Record<string, Blob>
}

export type ZipModelData = ModelData & {
  thumbnail: string
  metrics: Metrics
}

export type SortedContent = { male: Record<string, Blob>; female: Record<string, Blob>; all: Record<string, Blob> }

export type AcceptedFileProps = Pick<
  State,
  | 'id'
  | 'name'
  | 'description'
  | 'rarity'
  | 'file'
  | 'model'
  | 'metrics'
  | 'contents'
  | 'type'
  | 'bodyShape'
  | 'category'
  | 'thumbnail'
  | 'hasScreenshotTaken'
  | 'requiredPermissions'
  | 'video'
  | 'playMode'
  | 'tags'
  | 'blockVrmExport'
>
export type OwnProps = Pick<Props, 'metadata' | 'name' | 'onClose'>
export type MapStateProps = Pick<Props, 'address' | 'error' | 'isLoading' | 'collection' | 'itemStatus'>
export type MapDispatchProps = Pick<Props, 'onSave'>
export type MapDispatch = Dispatch<SaveItemRequestAction>
