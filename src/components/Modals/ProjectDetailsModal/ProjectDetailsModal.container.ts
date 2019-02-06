import { connect } from 'react-redux'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from '../Modals.types'
import ProjectDetailsModal from './ProjectDetailsModal'
import { getCurrentProject } from 'modules/project/selectors'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClose: (name: string) => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(ProjectDetailsModal)
