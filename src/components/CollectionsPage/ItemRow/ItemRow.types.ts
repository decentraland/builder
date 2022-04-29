import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Item } from 'modules/item/types'

export type Props = {
  item: Item
  onNavigate: (path: string) => void
}

export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
