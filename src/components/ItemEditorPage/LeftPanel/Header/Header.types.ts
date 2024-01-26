import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'

export type Props = {
  address?: string
  collection?: Collection
  isLoggedIn: boolean
  isReviewing: boolean
  isFromCollections: boolean
  isFromTPCollections: boolean
  onOpenModal: typeof openModal
  onNavigate: (path: string) => void
  onDeleteCollection: typeof deleteCollectionRequest
  onDeleteItem: typeof deleteItemRequest
  hasEditRights: boolean
  hasUserOrphanItems: boolean | undefined
}

export type MapStateProps = Pick<
  Props,
  | 'address'
  | 'collection'
  | 'isLoggedIn'
  | 'isReviewing'
  | 'hasEditRights'
  | 'hasUserOrphanItems'
  | 'isFromCollections'
  | 'isFromTPCollections'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDeleteCollection' | 'onDeleteItem'>
export type MapDispatch = Dispatch<OpenModalAction | CallHistoryMethodAction | DeleteCollectionRequestAction | DeleteItemRequestAction>
