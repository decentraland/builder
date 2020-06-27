import { Dispatch } from 'redux'
import { ModalProps, Coord } from 'decentraland-ui'
import { Land, LandTile } from 'modules/land/types'

export type Props = ModalProps & {
  landTiles: Record<string, LandTile>
  metadata: {
    land: Land
  }
}

export type State = {
  selection: Coord[]
}

export type MapStateProps = Pick<Props, 'landTiles'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch<any>
export type OwnProps = {}
