// import { Dispatch } from 'redux'
// import { CallHistoryMethodAction } from 'connected-react-router'
import { Item } from 'modules/item/types'

export type Props = {
  item: Item | null
  isLoggedIn: boolean
  isLoading: boolean
  // onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'item' | 'isLoggedIn' | 'isLoading'>
export type MapDispatchProps = {} //Pick<Props, 'onNavigate'>
export type MapDispatch = {} // Dispatch<CallHistoryMethodAction>
