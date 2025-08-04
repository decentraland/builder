import { BodyShape, IPreviewController } from '@dcl/schemas'
import { Collection } from 'modules/collection/types'
import { setItems } from 'modules/editor/actions'
import { Item } from 'modules/item/types'

export enum ItemPanelTabs {
  TO_REVIEW = 'to-review',
  REVIEWED = 'reviewed',
  ALL_ITEMS = 'all-items'
}

export type State = {
  currentTab: ItemPanelTabs
  currentPages: Record<ItemPanelTabs, number>
  reviewedTabPage: number
  showGetMoreSamplesModal: boolean
  showAllItemsTabChangeModal: boolean
}

export type Props = {
  items: Item[]
  isLoading: boolean
  totalItems: number | null
  selectedItemId: string | null
  collection: Collection | null
  showSamplesModalAgain: boolean
  onToggleShowSamplesModalAgain: () => void
  onResetReviewedItems: () => void
  isReviewing: boolean
  isPlayingEmote: boolean
  visibleItems: Item[]
  reviewedItems: Item[]
  hasHeader: boolean
  bodyShape: BodyShape
  wearableController: IPreviewController | null
  initialPage?: number
  onSetItems: ActionFunction<typeof setItems>
  onReviewItems: () => void
  onLoadPage: (page: number) => void
  onLoadRandomPage: () => void
}
