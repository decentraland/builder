import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { setCollectionPageView, SetCollectionPageViewAction } from 'modules/ui/collection/actions'
import { CollectionPageView } from 'modules/ui/collection/types'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { fetchItemsRequest, FetchItemsRequestAction } from 'modules/item/actions'
import { fetchCollectionsRequest, FetchCollectionsRequestAction } from 'modules/collection/actions'
import { CollectionPaginationData } from 'modules/collection/reducer'
import { ItemPaginationData } from 'modules/item/reducer'

export enum TABS {
  COLLECTIONS,
  ITEMS
}

export type Props = {
  address?: string
  items: Item[]
  collections: Collection[]
  collectionsPaginationData: CollectionPaginationData | null
  itemsPaginationData?: ItemPaginationData | null
  view: CollectionPageView
  isThirdPartyManager: boolean
  isLoadingCollections: boolean
  isLoadingItems: boolean
  onNavigate: (path: string) => void
  onSetView: typeof setCollectionPageView
  onOpenModal: typeof openModal
  onFetchOrphanItems: typeof fetchItemsRequest
  onFetchCollections: typeof fetchCollectionsRequest
}

export type MapStateProps = Pick<
  Props,
  | 'address'
  | 'items'
  | 'collections'
  | 'collectionsPaginationData'
  | 'itemsPaginationData'
  | 'view'
  | 'isThirdPartyManager'
  | 'isLoadingCollections'
  | 'isLoadingItems'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onSetView' | 'onOpenModal' | 'onFetchOrphanItems' | 'onFetchCollections'>
export type MapDispatch = Dispatch<
  CallHistoryMethodAction | SetCollectionPageViewAction | OpenModalAction | FetchItemsRequestAction | FetchCollectionsRequestAction
>
