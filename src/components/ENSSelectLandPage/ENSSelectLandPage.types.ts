import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { match } from 'react-router'
import { LandTile, Land } from 'modules/land/types'
import { ENS } from 'modules/ens/types'

export type Props = {
  match: match<{ subdomain: string }>
  ens?: ENS
  landTiles?: Record<string, LandTile>
  isLoading: boolean
  onNavigate: (path: string) => void
  onBack: typeof goBack
}

export type State = {
  selectedLand?: Land
  hoveredLandId?: string
}

export type MapStateProps = Pick<Props, 'ens' | 'landTiles' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'match'>
