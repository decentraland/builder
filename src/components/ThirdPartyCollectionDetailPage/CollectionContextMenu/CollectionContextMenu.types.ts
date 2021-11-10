import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  name: string
  onOpenModal: typeof openModal
  onDelete: typeof deleteCollectionRequest
  onNavigate: (path: string) => void
}

export type OwnProps = Pick<Props, 'collection'>
export type MapStateProps = Pick<Props, 'items' | 'name'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDelete'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | DeleteCollectionRequestAction>
