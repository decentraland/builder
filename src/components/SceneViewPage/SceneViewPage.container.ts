import { connect } from 'react-redux'

import { isFetching, getCurrentPublicProject, getCurrentPool } from 'modules/pool/selectors'
import { RootState } from 'modules/common/types'
import { isPreviewing, isReady, isLoading } from 'modules/editor/selectors'
import { isLoggedIn } from 'modules/auth/selectors'
import { loadPublicProjectRequest } from 'modules/project/actions'
import { getCurrentScene } from 'modules/scene/selectors'
import { getCurrentAuthor } from 'modules/profile/selectors'
import { togglePreview, closeEditor } from 'modules/editor/actions'
import { openModal } from 'modules/modal/actions'

import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneViewPage.types'
import SceneViewPage from './SceneViewPage'
import { likePoolRequest } from 'modules/pool/actions'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isReady: !isLoading(state) && isReady(state),
  isFetching: isFetching(state) && !isReady(state),
  isLoggedIn: isLoggedIn(state),
  currentProject: getCurrentPublicProject(state),
  currentPool: getCurrentPool(state),
  currentScene: getCurrentScene(state),
  currentAuthor: getCurrentAuthor(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLikePool: (id: string, like: boolean = true) => dispatch(likePoolRequest(id, like)),
  onPreview: () => dispatch(togglePreview(true)),
  onCloseEditor: () => dispatch(closeEditor()),
  onLoadProject: (id: string, type: 'public' | 'pool' = 'public') => dispatch(loadPublicProjectRequest(id, type)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(SceneViewPage)
