import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { openModal, closeModal } from 'modules/modal/actions'
import { acceptTerms } from 'modules/contest/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ContestModal.types'
import ContestModal from './ContestModal'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onAcceptTerms: () => dispatch(acceptTerms()),
  onOpenModal: name => dispatch(openModal(name)),
  onClose: name => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(ContestModal)
