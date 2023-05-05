import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getENSByWallet } from 'modules/ens/selectors'
import { deployToWorldRequest } from 'modules/deployment/actions'
import { isLoading } from 'modules/deployment/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps } from './DeployToWorld.types'
import DeployToWorld from './DeployToWorld'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSByWallet(state),
  project: getCurrentProject(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (projectId: string, name: string) => {
    return dispatch(deployToWorldRequest(projectId, name))
  },
  onNavigate: (path: string) => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(DeployToWorld)
