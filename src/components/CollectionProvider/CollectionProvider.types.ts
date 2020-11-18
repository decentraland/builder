import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { fetchCollectionRequest, FetchCollectionRequestAction } from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import { fetchCollectionItemsRequest, FetchCollectionItemsRequestAction } from 'modules/item/actions'

export type Props = {
  id: string | null
  collection: Collection | null
  items: Item[]
  isLoading: boolean
  children: (collection: Collection | null, items: Item[], isLoading: boolean) => React.ReactNode
  onFetchCollection: typeof fetchCollectionRequest
  onFetchCollectionItems: typeof fetchCollectionItemsRequest
}

export type MapStateProps = Pick<Props, 'id' | 'collection' | 'items' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchCollection' | 'onFetchCollectionItems'>
export type MapDispatch = Dispatch<FetchCollectionRequestAction | FetchCollectionItemsRequestAction>
export type OwnProps = Partial<Pick<Props, 'id'>>
