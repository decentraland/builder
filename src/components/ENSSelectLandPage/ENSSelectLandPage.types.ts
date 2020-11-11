import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { match } from 'react-router'
import { LandTile } from 'modules/land/types'
import { ENS } from 'modules/ens/types'

export type State = {
  selectedSubdomain: string
}

export type Props = {
  match: match<{ subdomain: string }>
  ens: ENS
  landTiles: Record<string, LandTile>
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'ens' | 'landTiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'match'>
