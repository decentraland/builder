import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { AtlasTile, AtlasProps } from 'decentraland-ui'
import { Tile as BaseTile } from 'react-tile-map/lib/src/lib/common'
import { LandTile } from 'modules/land/types'

export type Tile = AtlasTile & { estate_id?: string }

export type Props = Partial<AtlasProps> & {
  atlasTiles: Record<string, Tile>
  landTiles: Record<string, LandTile>
  deploymentTiles: Record<string, BaseTile>
  selection?: { x: number | string; y: number | string }[]
  isEstate?: boolean
  showOperator?: boolean
  showOwner?: boolean
}

export type MapStateProps = Pick<Props, 'atlasTiles' | 'landTiles' | 'deploymentTiles'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch<CallHistoryMethodAction>
