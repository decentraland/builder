import { Dispatch } from 'redux'
import { fetchCollectionItemsRequest, FetchCollectionItemsRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = {
  className?: string
  collectionId: string
  items: Item[]
  itemCount: number | undefined
  isLoading: boolean
  onFetchCollectionItems: typeof fetchCollectionItemsRequest
}

export type MapStateProps = Pick<Props, 'items' | 'itemCount' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchCollectionItems'>
export type MapDispatch = Dispatch<FetchCollectionItemsRequestAction>
export type OwnProps = Pick<Props, 'collectionId'>
