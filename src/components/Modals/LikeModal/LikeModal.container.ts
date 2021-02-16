import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoggedIn } from 'modules/identity/selectors'
import { MapStateProps, MapDispatchProps } from './LikeModal.types'
import LikeModal from './LikeModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (_dispatch: Dispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(LikeModal)
