import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'

export type Props = {
  items: Item[]
  collections: Collection[]
  isManager: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'items' | 'collections' | 'isManager' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
