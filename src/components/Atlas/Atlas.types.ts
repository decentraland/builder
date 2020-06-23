import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { AtlasTile, AtlasProps } from 'decentraland-ui'
import { Tile as BaseTile } from 'react-tile-map/lib/src/lib/common'
import { LandTile } from 'modules/land/types'

export type Tile = AtlasTile & { estate_id?: string }

export type Props = Partial<AtlasProps> & {
  atlasTiles: Record<string, Tile>
  landTiles: Record<string, LandTile>
  unoccupiedTiles: Record<string, BaseTile>
  selection?: { x: number | string; y: number | string }[]
  isEstate?: boolean
  showOperator?: boolean
  showOwner?: boolean
  hasPopup?: boolean
  hasLink?: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'atlasTiles' | 'landTiles' | 'unoccupiedTiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
