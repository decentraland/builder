import { Dispatch } from 'redux'
import { BodyShape, IPreviewController } from '@dcl/schemas'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { setItems, SetItemsAction } from 'modules/editor/actions'
import { fetchCollectionsRequest, FetchCollectionsRequestAction } from 'modules/collection/actions'
import {
  FetchCollectionItemsRequestAction,
  fetchItemsRequest,
  FetchItemsRequestAction,
  fetchOrphanItemRequest,
  FetchOrphanItemRequestAction
} from 'modules/item/actions'

export enum ItemEditorTabs {
  COLLECTIONS = 'collections',
  ORPHAN_ITEMS = 'orphanItems'
}

export type Props = {
  address?: string
  isConnected: boolean
  items: Item[]
  totalItems: number | null
  totalCollections: number | null
  orphanItems: Item[]
  collections: Collection[]
  selectedItemId: string | null
  selectedItem: Item | null
  selectedCollectionId: string | null
  visibleItems: Item[]
  reviewedItems: Item[]
  isReviewing: boolean
  bodyShape: BodyShape
  isLoading: boolean
  isPlayingEmote: boolean
  wearableController: IPreviewController | null
  hasUserOrphanItems: boolean | undefined
  onSetItems: ActionFunction<typeof setItems>
  onFetchOrphanItems: ActionFunction<typeof fetchItemsRequest>
  onFetchCollections: ActionFunction<typeof fetchCollectionsRequest>
  onSetReviewedItems: (itemIds: Item[]) => void
  onFetchOrphanItem: ActionFunction<typeof fetchOrphanItemRequest>
  onResetReviewedItems: () => void
}

export type State = {
  currentTab: ItemEditorTabs
  pages: number[]
  initialPage: number
  showSamplesModalAgain: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'address'
  | 'items'
  | 'totalItems'
  | 'totalCollections'
  | 'orphanItems'
  | 'collections'
  | 'selectedItemId'
  | 'selectedItem'
  | 'selectedCollectionId'
  | 'visibleItems'
  | 'bodyShape'
  | 'wearableController'
  | 'isConnected'
  | 'isReviewing'
  | 'isLoading'
  | 'isPlayingEmote'
  | 'hasUserOrphanItems'
>
export type MapDispatchProps = Pick<Props, 'onSetItems' | 'onFetchOrphanItems' | 'onFetchCollections' | 'onFetchOrphanItem'>
export type MapDispatch = Dispatch<
  | SetItemsAction
  | FetchCollectionItemsRequestAction
  | FetchItemsRequestAction
  | FetchCollectionsRequestAction
  | FetchOrphanItemRequestAction
>

// New type for the functional component container
export type LeftPanelContainerProps = Omit<Props, keyof MapStateProps | keyof MapDispatchProps>
