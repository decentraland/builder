import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Project } from 'modules/project/types'
import { getState as getEditor } from 'modules/editor/selectors'
import { exportProjectRequest } from 'modules/project/actions'
import { getData as getScenes } from 'modules/scene/selectors'
import { RootState } from 'modules/common/types'
import { MapDispatchProps, MapStateProps, OwnProps } from './ExportModal.types'
import ExportModal from './ExportModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { isLoading, progress, total } = getEditor(state).export
  const sceneId = ownProps.metadata?.project?.sceneId
  return {
    isLoading,
    isSDK6: !!sceneId && !!getScenes(state)[sceneId]?.sdk6,
    progress,
    total
  }
}

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onExport: (project: Project, migrateToSDK7?: boolean) => dispatch(exportProjectRequest(project, migrateToSDK7))
})

export default connect(mapState, mapDispatch)(ExportModal)
