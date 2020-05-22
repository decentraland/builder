import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Land, LandTile } from 'modules/land/types'

export enum LandPageView {
  ATLAS = 'atlas',
  GRID = 'grid'
}

export type Props = {
  lands: Land[]
  isLoggedIn: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  tiles: Record<string, LandTile>
}

export type State = {
  showOwner: boolean
  showOperator: boolean
  view: LandPageView
  page: number
  selectedLand: number
}

export type MapStateProps = Pick<Props, 'lands' | 'isLoggedIn' | 'isLoading' | 'tiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
