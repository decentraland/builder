import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getTiles } from 'modules/tile/selectors'
import { getLandTiles } from 'modules/land/selectors'
import { getEmptyTiles } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Atlas.types'
import Atlas from './Atlas'

const mapState = (state: RootState): MapStateProps => ({
  landTiles: getLandTiles(state),
  emptyTiles: getEmptyTiles(state),
  atlasTiles: getTiles(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(Atlas)
