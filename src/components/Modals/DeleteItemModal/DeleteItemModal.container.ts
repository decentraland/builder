import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { deleteItemRequest, DELETE_ITEM_REQUEST } from 'modules/item/actions'
import { getLoading } from 'modules/item/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './DeleteItemModal.types'
import DeleteItemModal from './DeleteItemModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), DELETE_ITEM_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDeleteItem: item => dispatch(deleteItemRequest(item))
})

export default connect(mapState, mapDispatch)(DeleteItemModal)
