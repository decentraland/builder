import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { loginRequest } from 'modules/identity/actions'
import { MapStateProps, MapDispatchProps, OwnProps } from './LikeModal.types'
import ShareModal from './LikeModal'

const mapState = (_state: RootState, _ownProps: OwnProps): MapStateProps => ({})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onLogin: () => dispatch(loginRequest())
})

export default connect(mapState, mapDispatch)(ShareModal)
