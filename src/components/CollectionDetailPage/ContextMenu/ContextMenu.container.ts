import { connect } from 'react-redux'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { openModal } from 'modules/modal/actions'
import { MapDispatchProps, MapDispatch } from './ContextMenu.types'
import ContextMenu from './ContextMenu'

const mapState = () => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDelete: collection => dispatch(deleteCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(ContextMenu)
