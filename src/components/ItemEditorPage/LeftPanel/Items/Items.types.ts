import { WearableBodyShape } from '@dcl/schemas'
import { setItems } from 'modules/editor/actions'
import { Item } from 'modules/item/types'

export enum ItemPanelTabs {
  TO_REVIEW = 'to-review',
  REVIEWED = 'reviewed',
  ALL_ITEMS = 'all-items'
}

export type State = {
  items: Item[]
  reviewed: Item[]
  currentTab: ItemPanelTabs
  currentPages: Record<ItemPanelTabs, number>
  reviewedTabPage: number
  showGetMoreSamplesModal: boolean
  doNotShowSamplesModalAgain: boolean
}

export type Props = {
  items: Item[]
  isLoading: boolean
  totalItems: number | null
  selectedItemId: string | null
  selectedCollectionId: string | null
  isReviewing: boolean
  visibleItems: Item[]
  hasHeader: boolean
  bodyShape: WearableBodyShape
  onSetItems: typeof setItems
  onLoadRandomPage: () => void
  onLoadPage: (page: number) => void
  onSetReviewedItems: (itemIds: Item[]) => void
}
