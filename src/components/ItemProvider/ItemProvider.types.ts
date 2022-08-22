import { Dispatch } from 'redux'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { FetchItemRequestAction, fetchItemRequest } from 'modules/item/actions'
import { fetchCollectionRequest, FetchCollectionRequestAction } from 'modules/collection/actions'

export type Props = {
  isConnected: boolean
  id: string | null
  item: Item | null
  collection: Collection | null
  isLoading: boolean
  children: (item: Item | null, collection: Collection | null, isLoading: boolean) => React.ReactNode
  onFetchItem: typeof fetchItemRequest
  onFetchCollection: typeof fetchCollectionRequest
}

export type State = {
  loadedItemId: string | undefined
}

export type MapStateProps = Pick<Props, 'isConnected' | 'id' | 'item' | 'collection' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchItem' | 'onFetchCollection'>
export type MapDispatch = Dispatch<FetchItemRequestAction | FetchCollectionRequestAction>
export type OwnProps = Partial<Pick<Props, 'id'>>
