import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { setCollectionPageView, SetCollectionPageViewAction } from 'modules/ui/collection/actions'
import { CollectionPageView } from 'modules/ui/collection/types'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { fetchItemsRequest, FetchItemsRequestAction } from 'modules/item/actions'

export enum TABS {
  COLLECTIONS,
  ITEMS
}

export type Props = {
  address?: string
  items: Item[]
  collections: Collection[]
  view: CollectionPageView
  isThirdPartyManager: boolean
  isLoadingCollections: boolean
  isLoadingItems: boolean
  onNavigate: (path: string) => void
  onSetView: typeof setCollectionPageView
  onOpenModal: typeof openModal
  onFetchOrphanItems: typeof fetchItemsRequest
}

export type MapStateProps = Pick<
  Props,
  'address' | 'items' | 'collections' | 'view' | 'isThirdPartyManager' | 'isLoadingCollections' | 'isLoadingItems'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onSetView' | 'onOpenModal' | 'onFetchOrphanItems'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | SetCollectionPageViewAction | OpenModalAction | FetchItemsRequestAction>
