import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { isLoggedIn } from 'modules/auth/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneViewMenu.types'
import SceneViewMenu from './SceneViewMenu'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onTryItOut: () => dispatch(navigateTo(locations.root()))
})

export default connect(mapState, mapDispatch)(SceneViewMenu)
