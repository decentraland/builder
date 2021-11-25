import { BuilderAPI } from 'lib/api/builder'
import { call, put, takeEvery } from 'redux-saga/effects'
import { ContractName, getContract } from 'decentraland-transactions'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { ChainId, Network } from '@dcl/schemas'
import {
  buyThirdPartyItemTiersFailure,
  buyThirdPartyItemTiersSuccess,
  BUY_THIRD_PARTY_ITEM_TIERS_REQUEST,
  BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS,
  FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST,
  fetchThirdPartyItemTiersFailure,
  fetchThirdPartyItemTiersSuccess,
  FetchThirdPartyItemTiersRequestAction,
  BuyThirdPartyItemTiersRequestAction
} from './actions'
import { ThirdPartyItemTier } from './types'

export function* tiersSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST, handleFetchThirdPartyItemTiersRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_TIERS_REQUEST, handleBuyThirdPartyItemTierRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, handleBuyThirdPartyItemTiersSuccess)

  function* handleFetchThirdPartyItemTiersRequest(_: FetchThirdPartyItemTiersRequestAction) {
    try {
      const tiers: ThirdPartyItemTier[] = yield call([builder, 'fetchThirdPartyItemTiers'])
      yield put(fetchThirdPartyItemTiersSuccess(tiers))
    } catch (error) {
      yield put(fetchThirdPartyItemTiersFailure(error.message))
    }
  }

  function* handleBuyThirdPartyItemTierRequest(action: BuyThirdPartyItemTiersRequestAction) {
    const { thirdParty, tier } = action.payload
    try {
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const thirdPartyContract = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
      const txHash: string = yield call(sendTransaction, thirdPartyContract, instantiatedThirdPartyContractContract =>
        instantiatedThirdPartyContractContract.buyItemSlots(thirdParty.id, tier.id, tier.price)
      )
      yield put(buyThirdPartyItemTiersSuccess(txHash, maticChainId, thirdParty, tier))
    } catch (error) {
      yield put(buyThirdPartyItemTiersFailure(error.message, thirdParty.id, tier))
    }
  }

  function* handleBuyThirdPartyItemTiersSuccess() {
    yield put(closeModal('BuyItemSlotsModal'))
  }
}
