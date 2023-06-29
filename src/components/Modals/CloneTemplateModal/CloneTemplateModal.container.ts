import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/common/types'
import { duplicateProjectRequest, DUPLICATE_PROJECT_REQUEST } from 'modules/project/actions'
import { getError as getProjectError, getLoading as getProjectLoading } from 'modules/project/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps } from './CloneTemplateModal.types'

import CloneTemplateModal from './CloneTemplateModal'

const mapState = (state: RootState): MapStateProps => {
  return {
    error: getProjectError(state),
    isLoading: isLoadingType(getProjectLoading(state), DUPLICATE_PROJECT_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDuplicate: (project, type) => dispatch(duplicateProjectRequest(project, type))
})

export default connect(mapState, mapDispatch)(CloneTemplateModal)
