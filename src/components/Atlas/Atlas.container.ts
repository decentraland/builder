import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getTiles } from 'modules/tile/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Atlas.types'
import Atlas from './Atlas'

const mapState = (state: RootState): MapStateProps => ({
  tiles: getTiles(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Atlas)
