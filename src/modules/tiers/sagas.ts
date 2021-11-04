import { BuilderAPI } from 'lib/api/builder'
import { call, put, takeEvery } from 'redux-saga/effects'
import { ContractName, getContract } from 'decentraland-transactions'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { ChainId, Network } from '@dcl/schemas'
import {
  buyThirdPartyItemTiersFailure,
  BuyThirdPartyItemTiersRequestAction,
  buyThirdPartyItemTiersSuccess,
  BUY_THIRD_PARTY_ITEM_TIERS_REQUEST,
  fetchThirdPartyItemTiersFailure,
  FetchThirdPartyItemTiersRequestAction,
  fetchThirdPartyItemTiersSuccess,
  FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST
} from './action'
import { ThirdPartyItemTier } from './types'

export function* tiersSagas(builder: BuilderAPI) {
  yield takeEvery(FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST, handleFetchThirdPartyItemTiersRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_TIERS_REQUEST, handleBuyThirdPartyItemTierRequest)

  function* handleFetchThirdPartyItemTiersRequest(_: FetchThirdPartyItemTiersRequestAction) {
    try {
      const tiers: ThirdPartyItemTier[] = yield call([builder, 'fetchThirdPartyItemTiers'])
      yield put(fetchThirdPartyItemTiersSuccess(tiers))
    } catch (error) {
      yield put(fetchThirdPartyItemTiersFailure(error.message))
    }
  }

  function* handleBuyThirdPartyItemTierRequest(action: BuyThirdPartyItemTiersRequestAction) {
    const { thirdPartyId, tier } = action.payload
    try {
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const thirdPartyContract = getContract(ContractName.ThirdPartyRegistry, maticChainId)
      const txHash: string = yield call(sendTransaction, thirdPartyContract, instantiatedThirdPartyContractContract =>
        instantiatedThirdPartyContractContract.buyItemSlots(thirdPartyId, tier.id, tier.price)
      )
      yield put(buyThirdPartyItemTiersSuccess(txHash, maticChainId, thirdPartyId, tier))
    } catch (error) {
      yield put(buyThirdPartyItemTiersFailure(error.message, thirdPartyId, tier))
    }
  }
}
