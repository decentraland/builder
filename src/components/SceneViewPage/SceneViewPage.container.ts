import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { RootState } from 'modules/common/types'
import { likePoolRequest } from 'modules/pool/actions'
import { loadProjectSceneRequest, loadPublicProjectRequest } from 'modules/project/actions'
import { isFetching, getCurrentPool } from 'modules/pool/selectors'
import { isPreviewing, isReady, isLoading } from 'modules/editor/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { getData as getScenes, getIsLoading as getIsLoadingScene } from 'modules/scene/selectors'
import { getCurrentAuthor } from 'modules/profile/selectors'
import { togglePreview, closeEditor } from 'modules/editor/actions'
import { getCurrentProject, getLoading as getLoadingProject } from 'modules/project/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { PreviewType } from 'modules/editor/types'
import { Project } from 'modules/project/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneViewPage.types'
import SceneViewPage from './SceneViewPage'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isReady: !isLoading(state) && isReady(state),
  isFetching: isFetching(state) && !isReady(state),
  isLoggedIn: isLoggedIn(state),
  currentProject: getCurrentProject(state),
  currentPool: getCurrentPool(state),
  scenes: getScenes(state),
  currentAuthor: getCurrentAuthor(state),
  isLoading: getIsLoadingScene(state) || !!getLoadingProject(state).length
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLikePool: (id: string, like = true) => dispatch(likePoolRequest(id, like)),
  onPreview: () => dispatch(togglePreview(true)),
  onCloseEditor: () => dispatch(closeEditor()),
  onLoadProject: (id: string, type: PreviewType.PUBLIC | PreviewType.POOL = PreviewType.PUBLIC) =>
    dispatch(loadPublicProjectRequest(id, type)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLoadProjectScene: (project: Project, type: PreviewType.PUBLIC | PreviewType.POOL) => dispatch(loadProjectSceneRequest(project, type))
})

export default connect(mapState, mapDispatch)(withRouter(SceneViewPage))
