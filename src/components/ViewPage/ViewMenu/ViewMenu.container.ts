import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './ViewMenu.types'
import ViewMenu from './ViewMenu'
import { isLoggedIn } from 'modules/auth/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({
  onTryItOut: () => null
})

export default connect(mapState, mapDispatch)(ViewMenu)
