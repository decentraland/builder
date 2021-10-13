import { resetItemRequest, RESET_ITEM_REQUEST } from 'modules/item/actions'
import { getError, getLoading } from 'modules/item/selectors'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import ResetItemModal from './ResetItemModal'
import { MapDispatch, MapDispatchProps, OwnProps, MapStateProps } from './ResetItemModal.types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

const mapStateProps = (state: RootState): MapStateProps => {
  return {
    error: getError(state),
    isLoading: isLoadingType(getLoading(state), RESET_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch, { metadata }: OwnProps): MapDispatchProps => {
  return {
    onConfirm: () => dispatch(resetItemRequest(metadata.itemId))
  }
}

export default connect(mapStateProps, mapDispatch)(ResetItemModal)
