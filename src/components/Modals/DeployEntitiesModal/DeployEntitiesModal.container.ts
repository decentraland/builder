import { connect } from 'react-redux'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapDispatch, MapDispatchProps } from './DeployEntitiesModal.types'
import DeployEntitiesModal from './DeployEntitiesModal'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClose: () => dispatch(closeModal('DeployEntitiesModal'))
})

export default connect(undefined, mapDispatch)(DeployEntitiesModal)
