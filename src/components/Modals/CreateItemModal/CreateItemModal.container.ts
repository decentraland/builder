import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { saveItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { getLoading, getError } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CreateItemModal.types'
import CreateItemModal from './CreateItemModal'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  error: getError(state),
  isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (item, contents) => dispatch(saveItemRequest(item, contents))
})

export default connect(mapState, mapDispatch)(CreateItemModal)
