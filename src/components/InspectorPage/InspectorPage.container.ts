import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isLoggedIn } from 'modules/identity/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { connectInspector, openInspector } from 'modules/inspector/actions'
import { isReloading } from 'modules/inspector/selectors'
import { getIsSmartItemsEnabled } from 'modules/features/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './InspectorPage.types'
import EditorPage from './InspectorPage'

const mapState = (state: RootState): MapStateProps => {
  return {
    address: getAddress(state),
    isLoggedIn: isLoggedIn(state),
    scene: getCurrentScene(state),
    project: getCurrentProject(state),
    isReloading: isReloading(state),
    isSmartItemsEnabled: getIsSmartItemsEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpen: () => dispatch(openInspector()),
  onConnect: iframeId => dispatch(connectInspector(iframeId))
})

export default connect(mapState, mapDispatch)(EditorPage)
