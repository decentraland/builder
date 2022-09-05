import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { setCollection, SetCollectionAction } from 'modules/item/actions'
import { setItems, SetItemsAction } from 'modules/editor/actions'

export type Props = {
  ethAddress?: string
  collection: Collection
  item: Item
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onRemoveFromCollection: typeof setCollection
  onSetItems: typeof setItems
}

export type MapStateProps = Pick<Props, 'ethAddress'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onRemoveFromCollection' | 'onSetItems'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | SetCollectionAction | SetItemsAction>
