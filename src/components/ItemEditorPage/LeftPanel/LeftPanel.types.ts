import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { Item, WearableBodyShape } from 'modules/item/types'
import { setItems, SetItemsAction } from 'modules/editor/actions'

export type Props = {
  items: Item[]
  orphanItems: Item[]
  collections: Collection[]
  selectedItemId: string | null
  selectedCollectionId: string | null
  visibleItems: Item[]
  bodyShape: WearableBodyShape
  onSetItems: typeof setItems
}

export type MapStateProps = Pick<
  Props,
  'items' | 'collections' | 'orphanItems' | 'selectedItemId' | 'selectedCollectionId' | 'visibleItems' | 'bodyShape'
>
export type MapDispatchProps = Pick<Props, 'onSetItems'>
export type MapDispatch = Dispatch<SetItemsAction>
