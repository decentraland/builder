import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { SetLandPageViewAction } from 'modules/ui/land/actions'
import { NamesState } from 'modules/names/reducer'

export type Props = {
  names: NamesState
  isLoading: boolean
  onNavigate: (path: string) => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'names' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | SetLandPageViewAction>
