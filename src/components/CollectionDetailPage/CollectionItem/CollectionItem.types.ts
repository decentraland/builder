import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  item: Item
  onOpenModal: typeof openModal
  onNavigate: (path: string) => void
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onNavigate'>
export type MapDispatch = Dispatch<OpenModalAction | CallHistoryMethodAction>
