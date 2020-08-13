import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Tile as BaseTile } from 'react-tile-map/lib/src/lib/common'
import { AtlasTile, AtlasProps } from 'decentraland-ui'
import { LandTile } from 'modules/land/types'

export type Tile = AtlasTile & { estate_id?: string }

export type Props = Partial<AtlasProps> & {
  atlasTiles: Record<string, Tile>
  landTiles: Record<string, LandTile>
  emptyTiles: Record<string, BaseTile>
  showOperator?: boolean
  landId?: string
  showOwner?: boolean
  hasPopup?: boolean
  hasLink?: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'atlasTiles' | 'landTiles' | 'emptyTiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
