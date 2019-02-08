import { connect } from 'react-redux'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SubmitProjectModal.types'
import SubmitProjectModal from './SubmitProjectModal'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClose: (name: string) => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(SubmitProjectModal)
