import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { loginRequest } from 'modules/identity/actions'
import { isLoggedIn } from 'modules/identity/selectors'
import { MapStateProps, MapDispatchProps } from './LikeModal.types'
import ShareModal from './LikeModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onLogin: () => dispatch(loginRequest())
})

export default connect(mapState, mapDispatch)(ShareModal)
