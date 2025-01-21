import { Dispatch } from 'redux'
import { EmoteDataADR74, Rarity } from '@dcl/schemas'
import {
  deleteItemRequest,
  DeleteItemRequestAction,
  saveItemRequest,
  SaveItemRequestAction,
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
  campaignTag?: string
  campaignName?: string
  isVrmOptOutEnabled: boolean
  isWearableUtilityEnabled: boolean
  onSaveItem: typeof saveItemRequest
  onDeleteItem: typeof deleteItemRequest
  onOpenModal: typeof openModal
  onDownload: typeof downloadItemRequest
}

export type State = {
  name: string
  description: string
  utility: string
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
  | 'campaignTag'
  | 'campaignName'
  | 'isVrmOptOutEnabled'
  | 'isWearableUtilityEnabled'
>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onDeleteItem' | 'onOpenModal' | 'onDownload'>
export type MapDispatch = Dispatch<SaveItemRequestAction | DeleteItemRequestAction | OpenModalAction | DownloadItemRequestAction>
