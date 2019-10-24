import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoggedIn } from 'modules/auth/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneViewMenu.types'
import SceneViewMenu from './SceneViewMenu'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({
  onTryItOut: () => null
})

export default connect(mapState, mapDispatch)(SceneViewMenu)
