import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'

export type Props = {
  address?: string
  collection?: Collection
  isLoggedIn: boolean
  isReviewing: boolean
  onOpenModal: typeof openModal
  onDeleteCollection: typeof deleteCollectionRequest
  onDeleteItem: typeof deleteItemRequest
  hasEditRights: boolean
  hasUserOrphanItems: boolean | undefined
}

export type MapStateProps = Pick<Props, 'address' | 'collection' | 'isLoggedIn' | 'isReviewing' | 'hasEditRights' | 'hasUserOrphanItems'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onDeleteCollection' | 'onDeleteItem'>
export type MapDispatch = Dispatch<OpenModalAction | DeleteCollectionRequestAction | DeleteItemRequestAction>
