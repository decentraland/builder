import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoggedIn } from 'modules/identity/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import { connectInspector, openInspector } from 'modules/inspector/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './InspectorPage.types'
import EditorPage from './InspectorPage'

const mapState = (state: RootState): MapStateProps => {
  return {
    isLoggedIn: isLoggedIn(state),
    scene: getCurrentScene(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpen: () => dispatch(openInspector()),
  onConnect: iframeId => dispatch(connectInspector(iframeId))
})

export default connect(mapState, mapDispatch)(EditorPage)
