import { Dispatch } from 'redux'
import { fetchCollectionItemsRequest, FetchCollectionItemsRequestAction } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  className?: string
  collectionId: string
  collection: Collection | null
  items: Item[]
  itemCount: number | undefined
  isLoading: boolean
  onFetchCollectionItems: typeof fetchCollectionItemsRequest
}

export type MapStateProps = Pick<Props, 'collection' | 'items' | 'itemCount' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchCollectionItems'>
export type MapDispatch = Dispatch<FetchCollectionItemsRequestAction>
export type OwnProps = Pick<Props, 'collectionId'>
