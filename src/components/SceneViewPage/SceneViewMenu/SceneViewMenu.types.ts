import { Dispatch } from 'redux'

export type Props = {
  isLoggedIn: boolean
  onTryItOut: () => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onTryItOut'>
export type MapDispatch = Dispatch
