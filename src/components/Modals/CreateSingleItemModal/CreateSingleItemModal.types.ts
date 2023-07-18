import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { IPreviewController } from '@dcl/schemas'
import { Metrics } from 'modules/models/types'
import { Collection } from 'modules/collection/types'
import { saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { BodyShapeType, Item, ItemRarity, ItemType } from 'modules/item/types'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details',
  THUMBNAIL = 'thumbnail',
  UPLOAD_VIDEO = 'upload_video',
  SET_PRICE = 'setPrice'
}

export type Props = ModalProps & {
  address?: string
  metadata: CreateSingleItemModalMetadata
  error: string | null
  isLoading: boolean
  collection: Collection | null
  isHandsCategoryEnabled: boolean
  onSave: typeof saveItemRequest
}

export type StateData = {
  id: string
  name: string
  description: string
  type: ItemType
  category: string
  playMode?: string
  rarity: ItemRarity
  bodyShape: BodyShapeType
  thumbnail: string
  model: string
  metrics: Metrics
  contents: Record<string, Blob>
  isRepresentation: boolean
  item: Item
  collectionId: string
  isLoading: boolean
  error: string
  file: File
  hasScreenshotTaken?: boolean
  previewController?: IPreviewController
  weareblePreviewUpdated: boolean
  video?: string
  requiredPermissions?: string[]
  timer: ReturnType<typeof setTimeout> | undefined
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
>
export type OwnProps = Pick<Props, 'metadata' | 'name' | 'onClose'>
export type MapStateProps = Pick<Props, 'address' | 'error' | 'isLoading' | 'collection' | 'isHandsCategoryEnabled'>
export type MapDispatchProps = Pick<Props, 'onSave'>
export type MapDispatch = Dispatch<SaveItemRequestAction>
