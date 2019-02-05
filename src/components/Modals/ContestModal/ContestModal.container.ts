import { connect } from 'react-redux'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { registerEmail } from 'modules/contest/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ContestModal.types'
import ContestModal from './ContestModal'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onRegisterEmail: (email: string) => dispatch(registerEmail(email)),
  onClose: (name: string) => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(ContestModal)
