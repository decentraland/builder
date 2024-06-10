import { match } from 'react-router'
import { LandTile, Land } from 'modules/land/types'
import { ENS } from 'modules/ens/types'

export type Props = {
  match: match<{ subdomain: string }>
  ens?: ENS
  landTiles?: Record<string, LandTile>
  isLoading: boolean
}

export type State = {
  selectedLand?: Land
  hoveredLandId?: string
}

export type MapStateProps = Pick<Props, 'ens' | 'landTiles' | 'isLoading'>
export type OwnProps = Pick<Props, 'match'>
