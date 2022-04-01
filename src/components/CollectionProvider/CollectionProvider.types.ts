import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { fetchCollectionRequest, FetchCollectionRequestAction } from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import {
  fetchAllCollectionItemsRequest,
  FetchAllCollectionItemsRequestAction,
  fetchCollectionItemsRequest,
  FetchCollectionItemsRequestAction
} from 'modules/item/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'

export const DEFAULT_ITEMS_PAGE = 1
export const DEFAULT_ITEMS_PAGE_SIZE = 50

export type Props = {
  id: string | null
  collection: Collection | null
  items: Item[]
  paginatedItems: Item[]
  itemsPage?: number | number[]
  itemsPageSize?: number
  curation: CollectionCuration | null
  itemCurations: ItemCuration[] | null
  isLoading: boolean
  isConnected: boolean
  children: ({
    collection,
    items,
    paginatedItems,
    curation,
    itemCurations,
    isLoading,
    onFetchAllCollectionItems
  }: {
    collection: Collection | null
    items: Item[]
    paginatedItems: Item[]
    curation: CollectionCuration | null
    itemCurations: ItemCuration[] | null
    isLoading: boolean
    onFetchAllCollectionItems: typeof fetchAllCollectionItemsRequest
  }) => React.ReactNode
  onFetchCollection: typeof fetchCollectionRequest
  onFetchCollectionItems: typeof fetchCollectionItemsRequest
  onFetchAllCollectionItems: typeof fetchAllCollectionItemsRequest
}

export type MapStateProps = Pick<
  Props,
  'id' | 'collection' | 'items' | 'isLoading' | 'isConnected' | 'curation' | 'itemCurations' | 'paginatedItems'
>
export type MapDispatchProps = Pick<Props, 'onFetchCollection' | 'onFetchCollectionItems' | 'onFetchAllCollectionItems'>
export type MapDispatch = Dispatch<FetchCollectionRequestAction | FetchCollectionItemsRequestAction | FetchAllCollectionItemsRequestAction>
export type OwnProps = Partial<Pick<Props, 'id' | 'itemsPage' | 'itemsPageSize'>>
