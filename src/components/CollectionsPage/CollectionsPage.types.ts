import { Dispatch } from 'redux'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { setCollectionPageView, SetCollectionPageViewAction } from 'modules/ui/collection/actions'
import { CollectionPageView } from 'modules/ui/collection/types'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { fetchItemsRequest, FetchItemsRequestAction, fetchOrphanItemRequest, FetchOrphanItemRequestAction } from 'modules/item/actions'
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
  isLoadingOrphanItem: boolean
  isCampaignEnabled: boolean
  hasUserOrphanItems: boolean | undefined
  onSetView: typeof setCollectionPageView
  onOpenModal: typeof openModal
  onFetchOrphanItems: typeof fetchItemsRequest
  onFetchCollections: typeof fetchCollectionsRequest
  onFetchOrphanItem: typeof fetchOrphanItemRequest
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
  | 'isLoadingOrphanItem'
  | 'isCampaignEnabled'
  | 'hasUserOrphanItems'
>
export type MapDispatchProps = Pick<Props, 'onSetView' | 'onOpenModal' | 'onFetchOrphanItems' | 'onFetchCollections' | 'onFetchOrphanItem'>
export type MapDispatch = Dispatch<
  SetCollectionPageViewAction | OpenModalAction | FetchItemsRequestAction | FetchCollectionsRequestAction | FetchOrphanItemRequestAction
>
