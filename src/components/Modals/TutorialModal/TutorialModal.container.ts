import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { closeModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps } from './TutorialModal.types'
import TutorialModal from './TutorialModal'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onClose: () => dispatch(closeModal('TutorialModal'))
})

export default connect(
  mapState,
  mapDispatch
)(TutorialModal)
