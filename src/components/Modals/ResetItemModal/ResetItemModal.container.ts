import { resetItemRequest } from 'modules/item/actions'
import { getError } from 'modules/item/selectors'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import ResetItemModal from './ResetItemModal'
import { MapDispatch, MapDispatchProps, OwnProps, MapStateProps } from './ResetItemModal.types'

const mapStateProps = (state: RootState): MapStateProps => {
  return {
    error: getError(state)
  }
}

const mapDispatch = (dispatch: MapDispatch, { metadata }: OwnProps): MapDispatchProps => {
  return {
    onConfirm: () => dispatch(resetItemRequest(metadata.itemId))
  }
}

export default connect(mapStateProps, mapDispatch)(ResetItemModal)
