import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { getEmail } from 'modules/user/selectors'
import { setEmail } from 'modules/user/actions'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps } from './TutorialModal.types'
import TutorialModal from './TutorialModal'

const mapState = (state: RootState): MapStateProps => ({
  email: getEmail(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onSetEmail: email => dispatch(setEmail(email))
})

export default connect(
  mapState,
  mapDispatch
)(TutorialModal)
