import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { Item, WearableBodyShape } from 'modules/item/types'
import { setItems, SetItemsAction } from 'modules/editor/actions'
import { setCollection, SetCollectionAction } from 'modules/item/actions'
import { ResetThirdPartyItems, resetThirdPartyItems, toggleThirdPartyItem, ToggleThirdPartyItemAction } from 'modules/ui/itemEditor/actions'

export type Props = {
  isConnected: boolean
  items: Item[]
  orphanItems: Item[]
  collections: Collection[]
  selectedItemId: string | null
  selectedCollectionId: string | null
  selectedThirdPartyItemIds: string[]
  visibleItems: Item[]
  bodyShape: WearableBodyShape
  onSetItems: typeof setItems
  onSetCollection: typeof setCollection
  onResetThirdPartyItems: typeof resetThirdPartyItems
  onToggleThirdPartyItem: typeof toggleThirdPartyItem
}

export type MapStateProps = Pick<
  Props,
  | 'items'
  | 'orphanItems'
  | 'collections'
  | 'selectedItemId'
  | 'selectedCollectionId'
  | 'selectedThirdPartyItemIds'
  | 'visibleItems'
  | 'bodyShape'
  | 'isConnected'
>
export type MapDispatchProps = Pick<Props, 'onSetItems' | 'onSetCollection' | 'onResetThirdPartyItems' | 'onToggleThirdPartyItem'>
export type MapDispatch = Dispatch<SetItemsAction | SetCollectionAction | ResetThirdPartyItems | ToggleThirdPartyItemAction>
