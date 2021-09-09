import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ModelMetrics } from 'modules/models/types'
import { saveItemRequest, SaveItemRequestAction, savePublishedItemRequest, SavePublishedItemRequestAction } from 'modules/item/actions'
import { BodyShapeType, Item, ItemRarity, WearableCategory } from 'modules/item/types'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details'
}

export type Props = ModalProps & {
  address?: string
  metadata: CreateItemModalMetadata
  error: string | null
  isLoading: boolean
  onSave: typeof saveItemRequest
  onSavePublished: typeof savePublishedItemRequest
}

export type StateData = {
  id: string
  name: string
  category: WearableCategory
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
}
export type State = { view: CreateItemView } & Partial<StateData>

export type CreateItemModalMetadata = {
  collectionId?: string
  item?: Item
  addRepresentation?: boolean
  changeItemFile?: boolean
}

export type SortedContent = { male: Record<string, Blob>; female: Record<string, Blob>; all: Record<string, Blob> }

export type MapStateProps = Pick<Props, 'address' | 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onSavePublished'>
export type MapDispatch = Dispatch<SaveItemRequestAction | SavePublishedItemRequestAction>
