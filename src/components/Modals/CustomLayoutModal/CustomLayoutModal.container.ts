import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { LOAD_MANIFEST_REQUEST, createProjectFromTemplate, duplicateProject } from 'modules/project/actions'
import { getError as getProjectError, getLoading as getProjectLoading } from 'modules/project/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps } from './CustomLayoutModal.types'

import CustomLayoutModal from './CustomLayoutModal'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLoadingProjectIds } from 'modules/sync/selectors'

const mapState = (state: RootState): MapStateProps => {
  return {
    isLoading: isLoadingType(getProjectLoading(state), LOAD_MANIFEST_REQUEST) || getLoadingProjectIds(state).length > 0,
    error: getProjectError(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateProject: (name, description, template) =>
    dispatch(
      createProjectFromTemplate(template, {
        title: name,
        description,
        onSuccess: project => dispatch(push(locations.sceneEditor(project.id)))
      })
    ),
  onDuplicate: (project, type) => dispatch(duplicateProject(project, type))
})

export default connect(mapState, mapDispatch)(CustomLayoutModal)
