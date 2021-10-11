import { resetItemRequest } from 'modules/item/actions'
import { connect } from 'react-redux'
import ResetItemModal from './ResetItemModal'
import { MapDispatch, MapDispatchProps, OwnProps } from './ResetItemModal.types'

const mapDispatch = (dispatch: MapDispatch, { metadata }: OwnProps): MapDispatchProps => {
  return {
    onConfirm: () => dispatch(resetItemRequest(metadata.itemId))
  }
}

export default connect(null, mapDispatch)(ResetItemModal)
