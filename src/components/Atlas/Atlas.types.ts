import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Tile } from 'react-tile-map/dist/lib/common'
import { AtlasTile, AtlasProps } from 'decentraland-ui'
import { LandTile } from 'modules/land/types'

export type Props = Partial<AtlasProps> & {
  atlasTiles: Record<string, AtlasTile>
  landTiles: Record<string, LandTile>
  emptyTiles: Record<string, Tile>
  showOperator?: boolean
  showTenant?: boolean
  showLessor?: boolean
  showControls?: boolean
  landId?: string
  showOwner?: boolean
  hasPopup?: boolean
  hasLink?: boolean
  onLocateLand?: () => void
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'atlasTiles' | 'landTiles' | 'emptyTiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
