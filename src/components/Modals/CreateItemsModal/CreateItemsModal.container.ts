import { connect } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapDispatchProps, MapDispatch } from './CreateItemsModal.types'
import CreateItemsModal from './CreateItemsModal'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(undefined, mapDispatch)(CreateItemsModal)
