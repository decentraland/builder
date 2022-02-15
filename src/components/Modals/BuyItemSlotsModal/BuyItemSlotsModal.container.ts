import { connect } from 'react-redux'
import { Network } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { getManaBalanceForNetwork } from 'modules/wallet/selectors'
import { ThirdParty } from 'modules/thirdParty/types'
import { getError, isBuyingItemSlots, isFetchingSlotPrice, getItemSlotPrice } from 'modules/thirdParty/selectors'
import { buyThirdPartyItemSlotRequest, fetchThirdPartyItemSlotPriceRequest } from 'modules/thirdParty/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './BuyItemSlotsModal.types'
import BuyItemSlotsModal from './BuyItemSlotsModal'

const mapState = (state: RootState): MapStateProps => {
  return {
    slotPrice: getItemSlotPrice(state),
    isFetchingSlotPrice: isFetchingSlotPrice(state),
    isBuyingItemSlots: isBuyingItemSlots(state),
    manaBalance: getManaBalanceForNetwork(state, Network.MATIC),
    error: getError(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchThirdPartyItemSlotPrice: () => dispatch(fetchThirdPartyItemSlotPriceRequest()),
  onBuyItemSlots: (thirdParty: ThirdParty, slotsToBuy: number, priceToPay: number) =>
    dispatch(buyThirdPartyItemSlotRequest(thirdParty, slotsToBuy, priceToPay))
})

export default connect(mapState, mapDispatch)(BuyItemSlotsModal)
