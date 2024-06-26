import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { LOAD_MANIFEST_REQUEST, createProjectFromTemplate } from 'modules/project/actions'
import { getError as getProjectError, getLoading as getProjectLoading } from 'modules/project/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps } from './CustomLayoutModal.types'

import CustomLayoutModal from './CustomLayoutModal'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLoadingProjectIds } from 'modules/sync/selectors'
import { SDKVersion } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { getIsCreateSceneOnlySDK7Enabled } from 'modules/features/selectors'

const mapState = (state: RootState): MapStateProps => {
  return {
    isLoading: isLoadingType(getProjectLoading(state), LOAD_MANIFEST_REQUEST) || getLoadingProjectIds(state).length > 0,
    error: getProjectError(state),
    isCreateSceneOnlySDK7Enabled: getIsCreateSceneOnlySDK7Enabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateProject: (name, description, template, sdk, history) =>
    dispatch(
      createProjectFromTemplate(template, {
        title: name,
        description,
        sdk,
        onSuccess: (project: Project) => {
          const redirectTo = sdk === SDKVersion.SDK6 ? locations.sceneEditor(project.id) : locations.inspector(project.id)
          history.push(redirectTo)
        }
      })
    )
})

export default connect(mapState, mapDispatch)(withRouter(CustomLayoutModal))
