import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (_: Dispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
