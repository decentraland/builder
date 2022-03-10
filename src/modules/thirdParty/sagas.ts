import { takeLatest, takeEvery, call, put, select, all, CallEffect } from 'redux-saga/effects'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, providers, utils } from 'ethers'
import { ChainId, Network } from '@dcl/schemas'
import { getChainIdByNetwork, getConnectedProvider, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
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
  pushChangesThirdPartyItemsSuccess,
  pushChangesThirdPartyItemsFailure,
  fetchThirdPartyAvailableSlotsRequest,
  PUBLISH_THIRD_PARTY_ITEMS_SUCCESS,
  PublishThirdPartyItemsSuccessAction,
  publishAndPushChangesThirdPartyItemsSuccess,
  publishAndPushChangesThirdPartyItemsFailure
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
  const provider: Provider | null = yield call(getConnectedProvider)
  if (!provider) {
    throw new Error('Could not get a valid connected Wallet')
  }
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

  // TODO: expose this as a function in decentraland-transactions
  const msgString = JSON.stringify({ domain, message: dataToSign, types: domainTypes, primaryType: 'ConsumeSlots' })

  const accounts: string[] = yield call([provider, 'request'], { method: 'eth_requestAccounts', params: [], jsonrpc: '2.0' })
  const from = accounts[0]

  const signature: string = yield call([provider, 'request'], {
    method: 'eth_signTypedData_v4',
    params: [from, msgString],
    jsonrpc: '2.0'
  })

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
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_SUCCESS, handlePublishThirdPartyItemSuccess)

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

  function* handlePublishThirdPartyItemSuccess(action: PublishThirdPartyItemsSuccessAction) {
    const { collectionId } = action.payload
    yield put(fetchThirdPartyAvailableSlotsRequest(collectionId))
  }

  function getCollectionId(items: Item[]): string {
    const collectionId = items[0].collectionId
    if (!collectionId) {
      throw new Error('The item does not have a collection associated')
    }
    return collectionId
  }

  function* publishChangesToThirdPartyItems(thirdParty: ThirdParty, items: Item[]) {
    const collectionId = getCollectionId(items)
    const { signature, signedMessage, salt } = yield call(getPublishItemsSignature, thirdParty.id, items.length)

    const { items: newItems, itemCurations: newItemCurations }: { items: Item[]; itemCurations: ItemCuration[] } = yield call(
      [builder, 'publishTPCollection'],
      collectionId,
      items.map(i => i.id),
      signedMessage,
      signature,
      items.length, // qty
      salt
    )
    return { newItems, newItemCurations }
  }

  function* handlePublishThirdPartyItemRequest(action: PublishThirdPartyItemsRequestAction) {
    const { thirdParty, items } = action.payload
    try {
      const collectionId = getCollectionId(items)
      const { newItems, newItemCurations }: { newItems: Item[]; newItemCurations: ItemCuration[] } = yield call(
        publishChangesToThirdPartyItems,
        thirdParty,
        items
      )

      yield put(publishThirdPartyItemsSuccess(collectionId, newItems, newItemCurations))
      yield put(closeModal('PublishThirdPartyCollectionModal'))
    } catch (error) {
      yield put(publishThirdPartyItemsFailure(error.message))
    }
  }

  function* pushChangesToThirdPartyItems(items: Item[]) {
    const collectionId = getCollectionId(items)

    const itemCurations: ItemCuration[] = yield select(getItemCurations, collectionId!)
    const effects: CallEffect<ItemCuration>[] = items.map(item => {
      const curation = itemCurations.find(itemCuration => itemCuration.itemId === item.id)
      if (curation?.status === CurationStatus.PENDING) {
        return call([builder, 'updateItemCurationStatus'], item.id, CurationStatus.PENDING)
      }
      return call([builder, 'pushItemCuration'], item.id) // FOR CURATIONS REJECTED/APPROVED
    })

    const newItemsCurations: ItemCuration[] = yield all(effects)
    return newItemsCurations
  }

  function* handlePushChangesThirdPartyItemRequest(action: PushChangesThirdPartyItemsRequestAction) {
    const { items } = action.payload
    try {
      const collectionId = getCollectionId(items)
      const newItemsCurations: ItemCuration[] = yield call(pushChangesToThirdPartyItems, items)
      yield put(pushChangesThirdPartyItemsSuccess(collectionId, newItemsCurations))
      yield put(closeModal('PublishThirdPartyCollectionModal'))
    } catch (error) {
      yield put(pushChangesThirdPartyItemsFailure(error.message))
    }
  }

  function* handlePublishAndPushChangesThirdPartyItemRequest(action: PublishAndPushChangesThirdPartyItemsRequestAction) {
    const { thirdParty, itemsToPublish, itemsWithChanges } = action.payload
    const collectionId = getCollectionId(itemsToPublish)
    // We need to execute these two methods in sequence, because the push changes will create a new curation if there was one already approved.
    // It will create them with status PENDING, so the publish will fail if it's executed after that event.
    // Publish items
    try {
      const resultFromPublish: { newItems: Item[]; newItemCurations: ItemCuration[] } = yield call(
        publishChangesToThirdPartyItems,
        thirdParty,
        itemsToPublish
      )

      const resultFromPushChanges: ItemCuration[] = yield call(pushChangesToThirdPartyItems, itemsWithChanges)
      const newItemCurations = [...resultFromPublish.newItemCurations, ...resultFromPushChanges]

      yield put(publishAndPushChangesThirdPartyItemsSuccess(collectionId, resultFromPublish.newItems, newItemCurations))
      yield put(fetchThirdPartyAvailableSlotsRequest(collectionId)) // re-fetch available slots after publishing
    } catch (error) {
      yield put(publishAndPushChangesThirdPartyItemsFailure(error.message)) // TODO: show to the user that something went wrong
    }

    yield put(closeModal('PublishThirdPartyCollectionModal'))
  }
}
