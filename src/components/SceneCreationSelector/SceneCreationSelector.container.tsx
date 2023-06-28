import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { openModal } from 'modules/modal/actions'
import { ModalName } from 'modules/modal/types'
import { MapDispatchProps, MapDispatch } from './SceneCreationSelector.types'
import SceneCreationSelector from './SceneCreationSelector'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name: ModalName, metadata) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path))
})

export default connect(null, mapDispatch)(SceneCreationSelector)
