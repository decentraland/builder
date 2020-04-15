import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { loginRequest } from 'modules/identity/actions'
import { MapStateProps, MapDispatchProps } from './LocalStorageToast.types'
import LocalStorageToast from './LocalStorageToast'

const mapState = (state: RootState): MapStateProps => ({
  project: getCurrentProject(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onLogin: () => dispatch(loginRequest())
})

export default connect(mapState, mapDispatch)(LocalStorageToast)
