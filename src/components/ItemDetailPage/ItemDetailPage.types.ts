import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = {
  item: Item | null
  isLoading: boolean
  onNavigate: (path: string) => void
  onDelete: typeof deleteItemRequest
}

export type MapStateProps = Pick<Props, 'item' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onDelete'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | DeleteItemRequestAction>
