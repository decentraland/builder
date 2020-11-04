import { Dispatch } from 'redux'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { FetchItemRequestAction, fetchItemRequest } from 'modules/item/actions'

export type Props = {
  id: string | null
  item: Item | null
  collection: Collection | null
  isLoading: boolean
  children: (item: Item | null, collection: Collection | null, isLoading: boolean) => React.ReactNode
  onFetchItem: typeof fetchItemRequest
}

export type MapStateProps = Pick<Props, 'id' | 'item' | 'collection' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchItem'>
export type MapDispatch = Dispatch<FetchItemRequestAction>
export type OwnProps = Partial<Pick<Props, 'id'>>
