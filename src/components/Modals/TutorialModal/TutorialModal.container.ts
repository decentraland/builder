import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { closeModal } from 'modules/modal/actions'
import { MapDispatchProps } from './TutorialModal.types'
import TutorialModal from './TutorialModal'

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onClose: () => dispatch(closeModal('TutorialModal'))
})

export default connect(null, mapDispatch)(TutorialModal)
