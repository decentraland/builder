import { Dispatch } from 'redux'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { createCollectionForumPostRequest, CreateCollectionForumPostRequestAction } from 'modules/forum/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  isForumPostLoading: boolean
  onOpenModal: typeof openModal
  onPostToForum: typeof createCollectionForumPostRequest
  onDelete: typeof deleteCollectionRequest
}

export type OwnProps = Pick<Props, 'collection'>
export type MapStateProps = Pick<Props, 'isForumPostLoading' | 'items'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onPostToForum' | 'onDelete'>
export type MapDispatch = Dispatch<OpenModalAction | CreateCollectionForumPostRequestAction | DeleteCollectionRequestAction>
