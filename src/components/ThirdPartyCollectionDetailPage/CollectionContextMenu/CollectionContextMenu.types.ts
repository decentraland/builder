import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ChainId } from '@dcl/schemas'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { createCollectionForumPostRequest, CreateCollectionForumPostRequestAction } from 'modules/forum/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  wallet: Wallet
  chainId?: ChainId,
  items: Item[]
  name: string
  isForumPostLoading: boolean
  onOpenModal: typeof openModal
  onPostToForum: typeof createCollectionForumPostRequest
  onDelete: typeof deleteCollectionRequest
  onNavigate: (path: string) => void
}

export type OwnProps = Pick<Props, 'collection'>
export type MapStateProps = Pick<Props, 'wallet' | 'items' | 'name' | 'isForumPostLoading' | 'chainId'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onPostToForum' | 'onDelete'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | CreateCollectionForumPostRequestAction | DeleteCollectionRequestAction>
