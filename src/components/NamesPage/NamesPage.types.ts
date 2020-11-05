import { Dispatch } from 'redux'

export type Props = {
  address?: string
  onNavigate: (path: string) => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'address'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch
