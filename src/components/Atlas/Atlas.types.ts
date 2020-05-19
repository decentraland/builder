import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { AtlasTile, AtlasProps } from 'decentraland-ui'

export type Tile = AtlasTile & { estate_id?: string }

export type Props = Partial<AtlasProps> & {
  tiles: Record<string, AtlasTile>
  selection?: { x: number | string; y: number | string }[]
  isEstate?: boolean
}

export type MapStateProps = Pick<Props, 'tiles'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch<CallHistoryMethodAction>
