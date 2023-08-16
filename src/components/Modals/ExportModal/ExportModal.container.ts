import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Project } from 'modules/project/types'
import { getState as getEditor } from 'modules/editor/selectors'
import { exportProjectRequest } from 'modules/project/actions'
import { RootState } from 'modules/common/types'
import { MapDispatchProps } from './ExportModal.types'
import ExportModal from './ExportModal'

const mapState = (state: RootState) => {
  const { isLoading, progress, total } = getEditor(state).export
  return {
    isLoading,
    progress,
    total
  }
}

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onExport: (project: Project) => dispatch(exportProjectRequest(project))
})

export default connect(mapState, mapDispatch)(ExportModal)
