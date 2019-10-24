import { connect } from 'react-redux'

import { getCurrentProject, isFetching } from 'modules/project/selectors'
import { RootState } from 'modules/common/types'
import { isPreviewing , isReady } from 'modules/editor/selectors'
import { isLoggedIn } from 'modules/auth/selectors'
import { loadPublicProjectRequest } from 'modules/project/actions'
import { getCurrentScene } from 'modules/scene/selectors'
import { getCurrentAuthor } from 'modules/profile/selectors'
import { togglePreview } from 'modules/editor/actions'

import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneViewPage.types'
import SceneViewPage from './SceneViewPage'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isReady: isReady(state),
  isFetching: isFetching(state) && !isReady(state),
  isLoggedIn: isLoggedIn(state),
  currentProject: getCurrentProject(state),
  currentScene: getCurrentScene(state),
  currentAuthor: getCurrentAuthor(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  // onOpenModal: name => dispatch(openModal(name)),
  onPreview: () => dispatch(togglePreview(true)),
  onLoadProject: (id: string, type: 'public' | 'pool' = 'public') => dispatch(loadPublicProjectRequest(id, type))
})

export default connect(mapState, mapDispatch)(SceneViewPage)
