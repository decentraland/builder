import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection | null
  items: Item[]
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onDelete: typeof deleteCollectionRequest
}

export type MapStateProps = Pick<Props, 'collection' | 'items' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDelete'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | DeleteCollectionRequestAction>
