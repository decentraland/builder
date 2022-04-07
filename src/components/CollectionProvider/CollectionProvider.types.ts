import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { fetchCollectionRequest, FetchCollectionRequestAction } from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import { FetchCollectionItemsRequestAction } from 'modules/item/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'

export type Props = {
  id: string | null
  collection: Collection | null
  items: Item[]
  curation: CollectionCuration | null
  itemCurations: ItemCuration[] | null
  isLoading: boolean
  isConnected: boolean
  children: ({
    collection,
    items,
    curation,
    itemCurations,
    isLoading
  }: {
    collection: Collection | null
    items: Item[]
    curation: CollectionCuration | null
    itemCurations: ItemCuration[] | null
    isLoading: boolean
  }) => React.ReactNode
  onFetchCollection: typeof fetchCollectionRequest
}

export type MapStateProps = Pick<Props, 'id' | 'collection' | 'items' | 'isLoading' | 'isConnected' | 'curation' | 'itemCurations'>
export type MapDispatchProps = Pick<Props, 'onFetchCollection'>
export type MapDispatch = Dispatch<FetchCollectionRequestAction | FetchCollectionItemsRequestAction>
export type OwnProps = Partial<Pick<Props, 'id'>>
