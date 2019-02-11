import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { registerEmail } from 'modules/contest/actions'
import { closeModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ContestModal.types'
import ContestModal from './ContestModal'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRegisterEmail: (email: string) => dispatch(registerEmail(email)),
  onClose: name => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(ContestModal)
