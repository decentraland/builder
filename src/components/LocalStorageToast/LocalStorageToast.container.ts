import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { login } from 'modules/auth/actions'
import { locations } from 'routing/locations'
import { getCurrentProject } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps } from './LocalStorageToast.types'
import LocalStorageToast from './LocalStorageToast'

const mapState = (state: RootState): MapStateProps => ({
  project: getCurrentProject(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onLogin: (projectId: string) => dispatch(login(locations.editor(projectId)))
})

export default connect(
  mapState,
  mapDispatch
)(LocalStorageToast)
