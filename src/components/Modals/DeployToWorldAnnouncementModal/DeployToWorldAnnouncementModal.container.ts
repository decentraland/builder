import { connect } from 'react-redux'
import { openModal } from 'modules/modal/actions'
import { MapDispatchProps, MapDispatch } from './DeployToWorldAnnouncementModal.types'
import DeployToWorldAnnouncementModal from './DeployToWorldAnnouncementModal'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(null, mapDispatch)(DeployToWorldAnnouncementModal)
