import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Project } from 'modules/project/types'
import { exportProject } from 'modules/project/actions'
import { MapDispatchProps } from './ExportModal.types'
import ExportModal from './ExportModal'

const mapState = () => ({})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onExport: (project: Project) => dispatch(exportProject(project))
})

export default connect(
  mapState,
  mapDispatch
)(ExportModal)
