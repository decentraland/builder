import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { getLandTiles } from 'modules/land/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './DeploymentDetail.types'
import DeploymentDetail from './DeploymentDetail'

const mapState = (state: RootState): MapStateProps => ({
  landTiles: getLandTiles(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(DeploymentDetail)
