import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection | null
  items: Item[]
  isLoading: boolean
  onNavigate: (path: string) => void
  onDelete: typeof deleteCollectionRequest
}

export type MapStateProps = Pick<Props, 'collection' | 'items' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onDelete'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | DeleteCollectionRequestAction>
