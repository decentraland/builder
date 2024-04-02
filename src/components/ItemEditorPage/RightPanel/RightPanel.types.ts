import { Dispatch } from 'redux'
import { EmoteDataADR74, Rarity } from '@dcl/schemas'
import {
  deleteItemRequest,
  DeleteItemRequestAction,
  saveItemRequest,
  SaveItemRequestAction,
  setCollection,
  SetCollectionAction,
  downloadItemRequest,
  DownloadItemRequestAction
} from 'modules/item/actions'
import { Item, SyncStatus, WearableData } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

export type Props = {
  address?: string
  collection: Collection | null
  selectedItem: Item | null
  selectedItemId: string | null
  canEditSelectedItem: boolean
  error: string | null
  itemStatus: SyncStatus | null
  isConnected: boolean
  isDownloading: boolean
  isCommitteeMember: boolean
  isCampaignEnabled: boolean
  isExoticRarityEnabled: boolean
  onSaveItem: typeof saveItemRequest
  onDeleteItem: typeof deleteItemRequest
  onOpenModal: typeof openModal
  onSetCollection: typeof setCollection
  onDownload: typeof downloadItemRequest
}

export type State = {
  name: string
  description: string
  thumbnail: string
  video: string
  rarity?: Rarity
  contents: Record<string, Blob>
  data?: WearableData | EmoteDataADR74
  hasItem: boolean
  isDirty: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'address'
  | 'collection'
  | 'selectedItem'
  | 'selectedItemId'
  | 'error'
  | 'itemStatus'
  | 'isConnected'
  | 'isDownloading'
  | 'isCommitteeMember'
  | 'canEditSelectedItem'
  | 'isCampaignEnabled'
  | 'isExoticRarityEnabled'
>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onDeleteItem' | 'onOpenModal' | 'onSetCollection' | 'onDownload'>
export type MapDispatch = Dispatch<
  SaveItemRequestAction | DeleteItemRequestAction | OpenModalAction | SetCollectionAction | DownloadItemRequestAction
>
