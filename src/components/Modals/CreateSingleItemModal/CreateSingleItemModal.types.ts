import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { IPreviewController } from '@dcl/schemas'
import { ModelMetrics } from 'modules/models/types'
import { Collection } from 'modules/collection/types'
import { saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { BodyShapeType, Item, ItemRarity, ItemType } from 'modules/item/types'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details',
  THUMBNAIL = 'thumbnail'
}

export type Props = ModalProps & {
  address?: string
  metadata: CreateSingleItemModalMetadata
  error: string | null
  isLoading: boolean
  collection: Collection | null
  isEmotesFeatureFlagOn: boolean
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
  metrics: ModelMetrics
  contents: Record<string, Blob>
  isRepresentation: boolean
  item: Item
  collectionId: string
  isLoading: boolean
  error: string
  file: File
  previewController?: IPreviewController
}
export type State = { view: CreateItemView } & Partial<StateData>

export type CreateSingleItemModalMetadata = {
  collectionId?: string
  item?: Item
  addRepresentation?: boolean
  changeItemFile?: boolean
}

export type ItemAssetJson = Pick<State, 'name' | 'description' | 'category' | 'rarity' | 'thumbnail' | 'model' | 'bodyShape'>

export type SortedContent = { male: Record<string, Blob>; female: Record<string, Blob>; all: Record<string, Blob> }

export type OwnProps = Pick<Props, 'metadata' | 'name' | 'onClose'>
export type MapStateProps = Pick<Props, 'address' | 'error' | 'isLoading' | 'collection' | 'isEmotesFeatureFlagOn'>
export type MapDispatchProps = Pick<Props, 'onSave'>
export type MapDispatch = Dispatch<SaveItemRequestAction>
