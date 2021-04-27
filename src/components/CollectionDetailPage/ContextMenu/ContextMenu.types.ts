import { Dispatch } from 'redux'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'

export type Props = {
  collection: Collection
  onOpenModal: typeof openModal
  onDelete: typeof deleteCollectionRequest
}

export type OwnProps = Pick<Props, 'collection'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onDelete'>
export type MapDispatch = Dispatch<OpenModalAction | DeleteCollectionRequestAction>
