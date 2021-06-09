import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { Item, WearableBodyShape } from 'modules/item/types'
import { setItems, SetItemsAction } from 'modules/editor/actions'
import { setCollection, SetCollectionAction } from 'modules/item/actions'

export type Props = {
  isConnected: boolean
  items: Item[]
  orphanItems: Item[]
  collections: Collection[]
  selectedItemId: string | null
  selectedCollectionId: string | null
  visibleItems: Item[]
  bodyShape: WearableBodyShape
  onSetItems: typeof setItems
  onSetCollection: typeof setCollection
}

export type MapStateProps = Pick<
  Props,
  'items' | 'orphanItems' | 'collections' | 'selectedItemId' | 'selectedCollectionId' | 'visibleItems' | 'bodyShape' | 'isConnected'
>
export type MapDispatchProps = Pick<Props, 'onSetItems' | 'onSetCollection'>
export type MapDispatch = Dispatch<SetItemsAction | SetCollectionAction>
