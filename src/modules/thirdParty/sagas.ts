import PQueue from 'p-queue'
import { takeLatest, takeEvery, call, put, select } from 'redux-saga/effects'
import { Authenticator, AuthIdentity } from 'dcl-crypto'
import { CatalystClient, DeploymentPreparationData } from 'dcl-catalyst-client'
import { Contract, providers } from 'ethers'
import { ChainId, Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { BuilderAPI } from 'lib/api/builder'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Item } from 'modules/item/types'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'
import { CurationStatus } from 'modules/curations/types'
import { getIdentity } from 'modules/identity/utils'
import { buildTPItemEntity } from 'modules/item/export'
import { waitForTx } from 'modules/transaction/utils'
import {
  FETCH_THIRD_PARTIES_REQUEST,
  fetchThirdPartiesRequest,
  fetchThirdPartiesSuccess,
  fetchThirdPartiesFailure,
  FetchThirdPartiesRequestAction,
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
  ReviewThirdPartyRequestAction,
  reviewThirdPartySuccess,
  reviewThirdPartyFailure,
  REVIEW_THIRD_PARTY_REQUEST,
  reviewThirdPartyTxSuccess,
  deployBatchedThirdPartyItemsSuccess,
  deployBatchedThirdPartyItemsFailure,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST,
  DeployBatchedThirdPartyItemsRequestAction
} from './actions'
import { getPublishItemsSignature } from './utils'
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

export function* thirdPartySaga(builder: BuilderAPI, catalyst: CatalystClient) {
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST, handleDeployBatchedThirdPartyItemsRequest)
  yield takeEvery(FETCH_THIRD_PARTIES_REQUEST, handleFetchThirdPartiesRequest)
  yield takeEvery(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST, handleFetchThirdPartyAvailableSlots)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_REQUEST, handlePublishThirdPartyItemRequest)
  yield takeEvery(PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePublishAndPushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_SUCCESS, handlePublishThirdPartyItemSuccess)
  yield takeLatest(REVIEW_THIRD_PARTY_REQUEST, handleReviewThirdPartyRequest)

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
    const MAX_CONCURRENT_REQUESTS = 3
    const queue = new PQueue({ concurrency: MAX_CONCURRENT_REQUESTS })
    const promisesOfItemsBeingUpdated: (() => Promise<ItemCuration>)[] = items.map((item: Item) => {
      const curation = itemCurations.find(itemCuration => itemCuration.itemId === item.id)
      if (curation?.status === CurationStatus.PENDING) {
        return () => builder.updateItemCurationStatus(item.id, CurationStatus.PENDING)
      }
      return () => builder.pushItemCuration(item.id) // FOR CURATIONS REJECTED/APPROVED
    })
    const newItemsCurations: ItemCuration[] = yield queue.addAll(promisesOfItemsBeingUpdated)
    if (newItemsCurations.some(itemCuration => itemCuration === undefined)) {
      throw Error('Some item curations were not pushed')
    }
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

  function* handleReviewThirdPartyRequest(action: ReviewThirdPartyRequestAction) {
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
      yield put(reviewThirdPartyTxSuccess(txHash, maticChainId))
      yield call(waitForTx, txHash)
      yield put(reviewThirdPartySuccess())
    } catch (error) {
      yield put(reviewThirdPartyFailure(error))
    }
  }

  function* handleDeployBatchedThirdPartyItemsRequest(action: DeployBatchedThirdPartyItemsRequestAction) {
    const { items, collection, tree, hashes } = action.payload
    const REQUESTS_BATCH_SIZE = 5

    let queue = new PQueue({ concurrency: REQUESTS_BATCH_SIZE })
    try {
      const identity: AuthIdentity | undefined = yield call(getIdentity)

      if (!identity) {
        throw new Error('Invalid Identity')
      }

      const promisesOfItemsBeingDeployed: (() => Promise<ItemCuration>)[] = items.map((item: Item) => async () => {
        const entity: DeploymentPreparationData = await buildTPItemEntity(catalyst, builder, collection, item, tree, hashes[item.id])
        await catalyst.deployEntity({ ...entity, authChain: Authenticator.signPayload(identity, entity.entityId) })
        return builder.updateItemCurationStatus(item.id, CurationStatus.APPROVED)
      })

      const deployedItemsCurations: ItemCuration[] = yield call([queue, 'addAll'], promisesOfItemsBeingDeployed)

      yield put(deployBatchedThirdPartyItemsSuccess(collection, deployedItemsCurations))
    } catch (error) {
      queue.clear()
      yield put(deployBatchedThirdPartyItemsFailure(items, error.message))
    }
  }
}
