import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { Item, WearableBodyShape } from 'modules/item/types'
import { setItems, SetItemsAction } from 'modules/editor/actions'

export type Props = {
  items: Item[]
  collections: Collection[]
  selectedItemId: string | null
  selectedCollectionId: string | null
  visibleItems: Item[]
  bodyShape: WearableBodyShape
  onNavigate: (path: string) => void
  onSetItems: typeof setItems
}

export type MapStateProps = Pick<Props, 'items' | 'collections' | 'selectedItemId' | 'selectedCollectionId' | 'visibleItems' | 'bodyShape'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onSetItems'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | SetItemsAction>
