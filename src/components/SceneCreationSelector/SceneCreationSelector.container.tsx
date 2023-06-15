import { connect } from 'react-redux'
import { openModal } from 'modules/modal/actions'
import { ModalName } from 'modules/modal/types'
import { MapDispatchProps, MapDispatch } from './SceneCreationSelector.types'
import ScenesPage from './SceneCreationSelector'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name: ModalName, metadata) => dispatch(openModal(name, metadata))
})

export default connect(null, mapDispatch)(ScenesPage)
