import { takeLatest, takeEvery, call, put, select } from 'redux-saga/effects'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, providers, utils } from 'ethers'
import { ChainId, Network } from '@dcl/schemas'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { Provider } from 'decentraland-dapps/dist/modules/wallet/types'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { BuilderAPI } from 'lib/api/builder'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import {
  FETCH_THIRD_PARTIES_REQUEST,
  fetchThirdPartiesRequest,
  fetchThirdPartiesSuccess,
  fetchThirdPartiesFailure,
  FetchThirdPartiesRequestAction,
  FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_REQUEST,
  fetchThirdPartyItemSlotPriceSuccess,
  fetchThirdPartyItemSlotPriceFailure,
  BuyThirdPartyItemSlotRequestAction,
  BUY_THIRD_PARTY_ITEM_SLOT_REQUEST,
  buyThirdPartyItemSlotSuccess,
  buyThirdPartyItemSlotFailure,
  BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS,
  FetchThirdPartyAvailableSlotsRequestAction,
  fetchThirdPartyAvailableSlotsSuccess,
  FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST,
  fetchThirdPartyAvailableSlotsFailure
} from './actions'
import { ThirdParty } from './types'
import { getItemSlotPrice } from './selectors'

export function* getThirdPartyContract(chainId: ChainId, provider: providers.ExternalProvider) {
  const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, chainId)
  const thirdPartyContractInstance = new Contract(thirdPartyContract.address, thirdPartyContract.abi, new providers.Web3Provider(provider))
  return thirdPartyContractInstance
}

export function* getChainlinkOracleContract(chainId: ChainId, provider: providers.ExternalProvider) {
  const chainlinkOracle: ContractData = yield call(getContract, ContractName.ChainlinkOracle, chainId)
  const chainlinkOracleContract = new Contract(chainlinkOracle.address, chainlinkOracle.abi, new providers.Web3Provider(provider))
  return chainlinkOracleContract
}

export function* thirdPartySaga(builder: BuilderAPI) {
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeEvery(FETCH_THIRD_PARTIES_REQUEST, handleFetchThirdPartiesRequest)
  yield takeEvery(FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_REQUEST, handleFetchThirdPartyItemSlotPriceRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_SLOT_REQUEST, handleBuyThirdPartyItemSlotRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS, handleBuyThirdPartyItemSlotSuccess)
  yield takeEvery(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST, handleFetchThirdPartyAvailableSlots)

  function* handleLoginSuccess(action: LoginSuccessAction) {
    const { wallet } = action.payload
    yield put(fetchThirdPartiesRequest(wallet.address))
  }

  function* handleFetchThirdPartiesRequest(action: FetchThirdPartiesRequestAction) {
    const { address } = action.payload
    try {
      const thirdParties: ThirdParty[] = yield call([builder, 'fetchThirdParties'], address)
      yield put(fetchThirdPartiesSuccess(thirdParties))
    } catch (error) {
      yield put(fetchThirdPartiesFailure(error.message))
    }
  }

  function* handleFetchThirdPartyAvailableSlots(action: FetchThirdPartyAvailableSlotsRequestAction) {
    const { thirdPartyId } = action.payload
    try {
      const availableSlots: number = yield call([builder, 'fetchThirdPartyAvailableSlots'], thirdPartyId)
      yield put(fetchThirdPartyAvailableSlotsSuccess(thirdPartyId, availableSlots))
    } catch (error) {
      yield put(fetchThirdPartyAvailableSlotsFailure(error.message))
    }
  }

  function* handleFetchThirdPartyItemSlotPriceRequest() {
    try {
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const provider: Provider = yield call(getNetworkProvider, maticChainId)

      const thirdPartyContractInstance: Contract = yield call(getThirdPartyContract, maticChainId, provider)
      const itemSlotPrice: BigNumber = yield call(thirdPartyContractInstance.itemSlotPrice) // USD

      const chainlinkOracleInstance: Contract = yield call(getChainlinkOracleContract, maticChainId, provider)
      const rate: BigNumber = yield call(chainlinkOracleInstance.getRate) // USD/MANA
      const slotPriceInMANA = itemSlotPrice.div(rate) // USD*MANA/USD
      yield put(fetchThirdPartyItemSlotPriceSuccess(+slotPriceInMANA))
    } catch (error) {
      yield put(fetchThirdPartyItemSlotPriceFailure(error.message))
    }
  }

  function* handleBuyThirdPartyItemSlotRequest(action: BuyThirdPartyItemSlotRequestAction) {
    const { slotsToBuy, thirdParty } = action.payload
    try {
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
      const itemSlotPriceInMANA: number = yield select(getItemSlotPrice)
      const maxPriceToPay = slotsToBuy * itemSlotPriceInMANA // slot * MANA/slot
      const maxPriceInWei = utils.parseEther(maxPriceToPay.toString())
      const txHash: string = yield call(sendTransaction, thirdPartyContract, instantiatedThirdPartyContract =>
        instantiatedThirdPartyContract.buyItemSlots(thirdParty.id, slotsToBuy, maxPriceInWei)
      )
      yield put(buyThirdPartyItemSlotSuccess(txHash, maticChainId, thirdParty, slotsToBuy))
    } catch (error) {
      yield put(buyThirdPartyItemSlotFailure(thirdParty.id, slotsToBuy, error.message))
    }
  }

  function* handleBuyThirdPartyItemSlotSuccess() {
    yield put(closeModal('BuyItemSlotsModal'))
  }
}
