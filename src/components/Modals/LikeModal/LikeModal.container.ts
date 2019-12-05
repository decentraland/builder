import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, OwnProps } from './LikeModal.types'
import ShareModal from './LikeModal'
import { login } from 'modules/auth/actions'

const mapState = (_state: RootState, _ownProps: OwnProps): MapStateProps => ({
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onLogin: options => dispatch(login(options))
})

export default connect(
  mapState,
  mapDispatch
)(ShareModal)
