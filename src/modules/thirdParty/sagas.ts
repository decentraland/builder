import { takeLatest, takeEvery, call, put, select, all, CallEffect } from 'redux-saga/effects'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, providers, utils } from 'ethers'
import { ChainId, Network } from '@dcl/schemas'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { Provider } from 'decentraland-dapps/dist/modules/wallet/types'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { BuilderAPI } from 'lib/api/builder'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Item } from 'modules/item/types'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'
import { CurationStatus } from 'modules/curations/types'
import { waitForTx } from 'modules/transaction/utils'
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
  publishAndPushChangesThirdPartyItemsFailure,
  ConsumeThirdPartyItemSlotsRequestAction,
  consumeThirdPartyItemSlotsSuccess,
  consumeThirdPartyItemSlotsFailure,
  CONSUME_THIRD_PARTY_ITEM_SLOTS_REQUEST,
  consumeThirdPartyItemSlotsTxSuccess
} from './actions'
import { applySlotBuySlippage, getPublishItemsSignature } from './utils'
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

export function* thirdPartySaga(builder: BuilderAPI) {
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(FETCH_TRANSACTION_SUCCESS, handleTransactionSuccess)
  yield takeEvery(FETCH_THIRD_PARTIES_REQUEST, handleFetchThirdPartiesRequest)
  yield takeEvery(FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_REQUEST, handleFetchThirdPartyItemSlotPriceRequest)
  yield takeEvery(BUY_THIRD_PARTY_ITEM_SLOT_REQUEST, handleBuyThirdPartyItemSlotRequest)
  yield takeEvery(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST, handleFetchThirdPartyAvailableSlots)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_REQUEST, handlePublishThirdPartyItemRequest)
  yield takeEvery(PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePublishAndPushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_SUCCESS, handlePublishThirdPartyItemSuccess)
  yield takeLatest(CONSUME_THIRD_PARTY_ITEM_SLOTS_REQUEST, handleConsumeSlotsRequest)

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

  function* handleTransactionSuccess(action: FetchTransactionSuccessAction) {
    const transaction = action.payload.transaction
    try {
      switch (transaction.actionType) {
        case BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS: {
          yield put(closeModal('BuyItemSlotsModal'))
          break
        }
        default: {
          break
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  function* handlePublishThirdPartyItemSuccess(action: PublishThirdPartyItemsSuccessAction) {
    const { thirdPartyId } = action.payload
    yield put(fetchThirdPartyAvailableSlotsRequest(thirdPartyId))
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
    const { signature, salt } = yield call(getPublishItemsSignature, thirdParty.id, items.length)

    const { items: newItems, itemCurations: newItemCurations }: { items: Item[]; itemCurations: ItemCuration[] } = yield call(
      [builder, 'publishTPCollection'],
      collectionId,
      items.map(i => i.id),
      {
        signature,
        qty: items.length,
        salt
      }
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

      yield put(publishThirdPartyItemsSuccess(thirdParty.id, collectionId, newItems, newItemCurations))
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
      yield put(fetchThirdPartyAvailableSlotsRequest(thirdParty.id)) // re-fetch available slots after publishing
      yield put(closeModal('PublishThirdPartyCollectionModal'))
    } catch (error) {
      yield put(publishAndPushChangesThirdPartyItemsFailure(error.message)) // TODO: show to the user that something went wrong
    }
  }

  function* handleConsumeSlotsRequest(action: ConsumeThirdPartyItemSlotsRequestAction) {
    const { thirdPartyId, slots, merkleTreeRoot } = action.payload
    try {
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
      const txHash: string = yield call(
        sendTransaction as any,
        thirdPartyContract,
        'reviewThirdPartyWithRoot',
        thirdPartyId,
        merkleTreeRoot,
        slots.map(slot => [slot.qty, slot.salt, slot.sigR, slot.sigS, slot.sigV])
      )
      yield put(consumeThirdPartyItemSlotsTxSuccess(txHash, maticChainId))
      yield call(waitForTx, txHash)
      yield put(consumeThirdPartyItemSlotsSuccess())
    } catch (error) {
      yield put(consumeThirdPartyItemSlotsFailure(error))
    }
  }
}
