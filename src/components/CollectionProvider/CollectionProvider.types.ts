import { FetchCollectionItemsParams } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import { fetchCollectionRequest } from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import { fetchCollectionItemsRequest } from 'modules/item/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'

export const DEFAULT_ITEMS_PAGE = 1
export const DEFAULT_ITEMS_PAGE_SIZE = 50

export type Props = {
  id: string | null | undefined
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
    onFetchCollectionItemsPages: ActionFunction<typeof fetchCollectionItemsRequest>
  }) => React.ReactNode
  onFetchCollection: ActionFunction<typeof fetchCollectionRequest>
  onFetchCollectionItems: ActionFunction<typeof fetchCollectionItemsRequest>
  onChangePage?: (page: number) => void
}

export type CollectionProviderContainerProps = Pick<
  Props,
  'id' | 'itemSelected' | 'itemsPage' | 'itemsPageSize' | 'onChangePage' | 'children' | 'fetchCollectionItemsOptions'
>
