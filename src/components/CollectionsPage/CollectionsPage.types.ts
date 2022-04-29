import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { setCollectionPageView, SetCollectionPageViewAction } from 'modules/ui/collection/actions'
import { CollectionPageView } from 'modules/ui/collection/types'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'

export type Props = {
  items: Item[]
  collections: Collection[]
  view: CollectionPageView
  isThirdPartyManager: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onSetView: typeof setCollectionPageView
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'items' | 'collections' | 'view' | 'isThirdPartyManager' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onSetView' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | SetCollectionPageViewAction | OpenModalAction>
