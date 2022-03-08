import { takeLatest, takeEvery, call, put, select, all, CallEffect } from 'redux-saga/effects'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ethers, providers, utils } from 'ethers'
import { ChainId, Network } from '@dcl/schemas'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { Provider } from 'decentraland-dapps/dist/modules/wallet/types'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { BuilderAPI } from 'lib/api/builder'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Item } from 'modules/item/types'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'
import { CurationStatus } from 'modules/curations/types'
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
  fetchThirdPartyAvailableSlotsFailure,
  PUBLISH_THIRD_PARTY_ITEMS_REQUEST,
  PublishThirdPartyItemsRequestAction,
  publishThirdPartyItemsSuccess,
  publishThirdPartyItemsFailure,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST,
  PushChangesThirdPartyItemsRequestAction,
  PublishAndPushChangesThirdPartyItemsRequestAction,
  publishThirdPartyItemsRequest,
  pushChangesThirdPartyItemsRequest,
  pushChangesThirdPartyItemsSuccess,
  pushChangesThirdPartyItemsFailure
} from './actions'
import { applySlotBuySlippage } from './utils'
import { ThirdParty } from './types'

export function* getContractInstance(
  contract: ContractName.ThirdPartyRegistry | ContractName.ChainlinkOracle,
  chainId: ChainId,
  provider: providers.ExternalProvider
) {
  const contractData: ContractData = yield call(getContract, contract, chainId)
  const contractInstance = new Contract(contractData.address, contractData.abi, new providers.Web3Provider(provider))
  return contractInstance
}

export function* getPublishItemsSignature(thirdPartyId: string, qty: number) {
  const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
  const provider = new ethers.providers.Web3Provider((window as any).ethereum)
  const signer = provider.getSigner()
  const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
  const salt = utils.hexlify(utils.randomBytes(32))
  const domain = {
    name: thirdPartyContract.name,
    verifyingContract: thirdPartyContract.address,
    version: thirdPartyContract.version,
    salt
  }
  const dataToSign = {
    thirdPartyId,
    qty,
    salt
  }
  const domainTypes = {
    ConsumeSlots: [
      { name: 'thirdPartyId', type: 'string' },
      { name: 'qty', type: 'uint256' },
      { name: 'salt', type: 'bytes32' }
    ]
  }
  const signature: string = yield call([signer, '_signTypedData'], domain, domainTypes, dataToSign)
  const AbiCoderInstance = new utils.AbiCoder()
  const signedMessage = AbiCoderInstance.encode(['string', 'uint256', 'bytes32'], Object.values(dataToSign))

  return { signature, signedMessage, salt }
}

export function* thirdPartySaga(builder: BuilderAPI) {
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeEvery(FETCH_THIRD_PARTIES_REQUEST, handleFetchThirdPartiesRequest)
  yield takeEvery(FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_REQUEST, handleFetchThirdPartyItemSlotPriceRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_SLOT_REQUEST, handleBuyThirdPartyItemSlotRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS, handleBuyThirdPartyItemSlotSuccess)
  yield takeEvery(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST, handleFetchThirdPartyAvailableSlots)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_REQUEST, handlePublishThirdPartyItemRequest)
  yield takeEvery(PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePublishAndPushChangesThirdPartyItemRequest)

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

      const thirdPartyContractInstance: Contract = yield call(getContractInstance, ContractName.ThirdPartyRegistry, maticChainId, provider)
      const itemSlotPrice: BigNumber = yield call(thirdPartyContractInstance.itemSlotPrice) // USD

      const chainlinkOracleInstance: Contract = yield call(getContractInstance, ContractName.ChainlinkOracle, maticChainId, provider)
      const rate: BigNumber = yield call(chainlinkOracleInstance.getRate) // USD/MANA
      const slotPriceInMANA = itemSlotPrice.div(rate) // USD*MANA/USD
      yield put(fetchThirdPartyItemSlotPriceSuccess(Number(slotPriceInMANA)))
    } catch (error) {
      yield put(fetchThirdPartyItemSlotPriceFailure(error.message))
    }
  }

  function* handleBuyThirdPartyItemSlotRequest(action: BuyThirdPartyItemSlotRequestAction) {
    const { slotsToBuy, thirdParty, priceToPay } = action.payload
    try {
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
      const costWithSlippage = applySlotBuySlippage(BigNumber.from(priceToPay).mul(BigNumber.from(slotsToBuy)))
      const maxPriceInWei = utils.parseEther(costWithSlippage.toString())
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

  function* handlePublishThirdPartyItemRequest(action: PublishThirdPartyItemsRequestAction) {
    const { thirdParty, items } = action.payload
    try {
      const collectionId = items[0].collectionId!

      const { signature, signedMessage, salt } = yield call(getPublishItemsSignature, thirdParty.id, items.length)

      const { items: newItems, itemCurations: newItemCurations }: { items: Item[]; itemCurations: ItemCuration[] } = yield call(
        [builder, 'publishCollection'],
        collectionId,
        items.map(i => i.id),
        signedMessage,
        signature,
        items.length, // qty
        salt
      )

      yield put(publishThirdPartyItemsSuccess(collectionId, newItems, newItemCurations))
      yield put(closeModal('PublishThirdPartyCollectionModal'))
    } catch (error) {
      yield put(publishThirdPartyItemsFailure(error.message))
    }
  }

  function* handlePushChangesThirdPartyItemRequest(action: PushChangesThirdPartyItemsRequestAction) {
    try {
      const { items } = action.payload
      const collectionId = items[0].collectionId
      if (!collectionId) return

      const itemCurations: ItemCuration[] = yield select(getItemCurations, collectionId!)
      const effects: CallEffect<void>[] = items.map(item => {
        const curation = itemCurations.find(ic => ic.itemId === item.id)
        if (curation?.status === CurationStatus.PENDING) {
          return call([builder, 'updateItemCurationStatus'], item.id, CurationStatus.PENDING)
        }
        return call([builder, 'pushItemCuration'], item.id) // FOR CURATIONS REJECTED/APPROVED
      })

      const newItemsCurations: ItemCuration[] = yield all(effects)
      yield put(pushChangesThirdPartyItemsSuccess(collectionId, newItemsCurations))
      yield put(closeModal('PublishThirdPartyCollectionModal'))
    } catch (error) {
      yield put(pushChangesThirdPartyItemsFailure(error.message))
    }
  }

  function* handlePublishAndPushChangesThirdPartyItemRequest(action: PublishAndPushChangesThirdPartyItemsRequestAction) {
    const { thirdParty, itemsToPublish, itemsWithChanges } = action.payload
    yield all([put(publishThirdPartyItemsRequest(thirdParty, itemsToPublish)), put(pushChangesThirdPartyItemsRequest(itemsWithChanges))])
  }
}
