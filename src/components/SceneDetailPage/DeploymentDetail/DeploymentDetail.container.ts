import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getLandTiles } from 'modules/land/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './DeploymentDetail.types'
import DeploymentDetail from './DeploymentDetail'

const mapState = (state: RootState): MapStateProps => ({
  landTiles: getLandTiles(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(withRouter(DeploymentDetail))
