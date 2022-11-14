import { Dispatch } from 'redux'
import { fetchCollectionThumbnailsRequest, FetchCollectionThumbnailsRequestAction } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  className?: string
  collectionId: string
  collection: Collection | null
  items: Item[]
  itemCount: number | undefined
  isLoading: boolean
  onFetchCollectionThumbnailsRequest: typeof fetchCollectionThumbnailsRequest
}

export type MapStateProps = Pick<Props, 'collection' | 'items' | 'itemCount' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchCollectionThumbnailsRequest'>
export type MapDispatch = Dispatch<FetchCollectionThumbnailsRequestAction>
export type OwnProps = Pick<Props, 'collectionId'>
