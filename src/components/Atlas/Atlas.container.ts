import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getTiles } from 'modules/tile/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Atlas.types'
import Atlas from './Atlas'
import { getLandTiles } from 'modules/land/selectors'
import { getDeploymentTiles } from 'modules/deployment/selectors'

const mapState = (state: RootState): MapStateProps => ({
  landTiles: getLandTiles(state),
  deploymentTiles: getDeploymentTiles(state),
  atlasTiles: getTiles(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Atlas)
