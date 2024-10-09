import { Dispatch } from 'redux'
import { FetchCollectionItemsParams } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import { fetchCollectionRequest, FetchCollectionRequestAction } from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import { fetchCollectionItemsRequest, FetchCollectionItemsRequestAction } from 'modules/item/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'

export const DEFAULT_ITEMS_PAGE = 1
export const DEFAULT_ITEMS_PAGE_SIZE = 50

export type Props = {
  id: string | null
  collection: Collection | null
  paginatedCollections: Collection[]
  items: Item[]
  paginatedItems: Item[]
  itemSelected?: string | null
  itemsPage?: number | number[]
  itemsPageSize?: number
  fetchCollectionItemsOptions?: FetchCollectionItemsParams
  curation: CollectionCuration | null
  itemCurations: ItemCuration[] | null
  isLoadingCollection: boolean
  isLoadingCollectionItems: boolean
  isConnected: boolean
  children: ({
    collection,
    items,
    paginatedItems,
    curation,
    itemCurations,
    initialPage,
    isLoadingCollection,
    isLoadingCollectionItems,
    onFetchCollectionItemsPages
  }: {
    collection: Collection | null
    paginatedCollections: Collection[]
    items: Item[]
    paginatedItems: Item[]
    curation: CollectionCuration | null
    itemCurations: ItemCuration[] | null
    initialPage: number
    isLoadingCollection: boolean
    isLoadingCollectionItems: boolean
    onFetchCollectionItemsPages: typeof fetchCollectionItemsRequest
  }) => React.ReactNode
  onFetchCollection: typeof fetchCollectionRequest
  onFetchCollectionItems: typeof fetchCollectionItemsRequest
  onChangePage?: (page: number) => void
}

export type MapStateProps = Pick<
  Props,
  | 'id'
  | 'collection'
  | 'items'
  | 'isLoadingCollection'
  | 'isLoadingCollectionItems'
  | 'isConnected'
  | 'curation'
  | 'itemCurations'
  | 'paginatedItems'
  | 'paginatedCollections'
>
export type MapDispatchProps = Pick<Props, 'onFetchCollection' | 'onFetchCollectionItems'>
export type MapDispatch = Dispatch<FetchCollectionRequestAction | FetchCollectionItemsRequestAction>
export type OwnProps = Partial<Pick<Props, 'id' | 'itemSelected' | 'itemsPage' | 'itemsPageSize' | 'onChangePage'>>
