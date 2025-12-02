import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import {
  CANCEL_ITEM_ORDER_TRADE_REQUEST,
  cancelItemOrderTradeRequest,
  CancelItemOrderTradeRequestAction,
  deleteItemRequest
} from 'modules/item/actions'
import { getLoading, getStatusByItemId } from 'modules/item/selectors'
import { setItems } from 'modules/editor/actions'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'
import { getIsOffchainPublicItemOrdersEnabled, getIsOffchainPublicItemOrdersEnabledVariants } from 'modules/features/selectors'
import { getWallet } from 'modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state)
  const loadingTradeIds = getLoading(state)
    .filter(action => action.type === CANCEL_ITEM_ORDER_TRADE_REQUEST)
    .map(action => (action as CancelItemOrderTradeRequestAction).payload.tradeId)
  return {
    ethAddress: getAddress(state),
    status: statusByItemId[ownProps.item.id],
    wallet: getWallet(state),
    isOffchainPublicItemOrdersEnabled: getIsOffchainPublicItemOrdersEnabled(state),
    isOffchainPublicItemOrdersEnabledVariants: getIsOffchainPublicItemOrdersEnabledVariants(state),
    isCancellingItemOrder: isLoadingType(getLoading(state), CANCEL_ITEM_ORDER_TRADE_REQUEST),
    loadingTradeIds
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onSetItems: items => dispatch(setItems(items)),
  onRemoveFromSale: tradeId => dispatch(cancelItemOrderTradeRequest(tradeId, true))
})

export default connect(mapState, mapDispatch)(CollectionItem)
