import PQueue from 'p-queue'
import { channel } from 'redux-saga'
import { takeLatest, takeEvery, call, put, select } from 'redux-saga/effects'
import { Contract, providers } from 'ethers'
import { Authenticator, AuthIdentity } from '@dcl/crypto'
import { ChainId, Network } from '@dcl/schemas'
import { CatalystClient, DeploymentPreparationData } from 'dcl-catalyst-client'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { closeModal, openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { showToast } from 'decentraland-dapps/dist/modules/toast/actions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { ToastType } from 'decentraland-ui'
import { BuilderAPI } from 'lib/api/builder'
import { ApprovalFlowModalView } from 'components/Modals/ApprovalFlowModal/ApprovalFlowModal.types'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Item } from 'modules/item/types'
import { updateApprovalFlowProgress } from 'modules/ui/thirdparty/action'
import {
  ThirdPartyBuildEntityError,
  ThirdPartyCurationUpdateError,
  ThirdPartyDeploymentError,
  ThirdPartyError
} from 'modules/collection/utils'
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
  const approvalFlowProgressChannel = channel()
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST, handleDeployBatchedThirdPartyItemsRequest)
  yield takeEvery(FETCH_THIRD_PARTIES_REQUEST, handleFetchThirdPartiesRequest)
  yield takeEvery(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST, handleFetchThirdPartyAvailableSlots)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_REQUEST, handlePublishThirdPartyItemRequest)
  yield takeEvery(PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePublishAndPushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_SUCCESS, handlePublishThirdPartyItemSuccess)
  yield takeLatest(REVIEW_THIRD_PARTY_REQUEST, handleReviewThirdPartyRequest)
  yield takeEvery(approvalFlowProgressChannel, handleUpdateApprovalFlowProgress)

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

  function* showActionErrorToast() {
    yield put(
      showToast({
        type: ToastType.ERROR,
        title: t('toast.third_party_action_failure.title'),
        body: t('toast.third_party_action_failure.body'),
        timeout: 6000,
        closable: true
      })
    )
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
    } catch (error) {
      yield showActionErrorToast()
      yield put(publishThirdPartyItemsFailure(error.message))
    } finally {
      yield put(closeModal('PublishThirdPartyCollectionModal'))
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
    } catch (error) {
      yield showActionErrorToast()
      yield put(pushChangesThirdPartyItemsFailure(error.message))
    } finally {
      yield put(closeModal('PublishThirdPartyCollectionModal'))
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
    } catch (error) {
      yield showActionErrorToast()
      yield put(publishAndPushChangesThirdPartyItemsFailure(error.message)) // TODO: show to the user that something went wrong
    } finally {
      yield put(closeModal('PublishThirdPartyCollectionModal'))
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

  function* handleUpdateApprovalFlowProgress(action: { progress: number }) {
    yield put(updateApprovalFlowProgress(action.progress))
  }

  function* handleDeployBatchedThirdPartyItemsRequest(action: DeployBatchedThirdPartyItemsRequestAction) {
    const { items, collection, tree, hashes } = action.payload
    const REQUESTS_BATCH_SIZE = 5

    let queue = new PQueue({ concurrency: REQUESTS_BATCH_SIZE })
    const errors: ThirdPartyError[] = []
    const identity: AuthIdentity | undefined = yield call(getIdentity)

    if (!identity) {
      yield put(deployBatchedThirdPartyItemsFailure(errors, 'Invalid Identity'))
      return
    }

    yield put(
      openModal('ApprovalFlowModal', {
        view: ApprovalFlowModalView.DEPLOYING_TP
      })
    )
    const promisesOfItemsBeingDeployed: (() => Promise<ItemCuration | void>)[] = items.map((item: Item) => async () => {
      let entity: DeploymentPreparationData
      try {
        entity = await buildTPItemEntity(catalyst, builder, collection, item, tree, hashes[item.id])
        try {
          await catalyst.deployEntity({ ...entity, authChain: Authenticator.signPayload(identity!, entity.entityId) })
          approvalFlowProgressChannel.put({
            progress: Math.round(((items.length - (queue.size + queue.pending)) / items.length) * 100)
          })
          let updatedCuration: ItemCuration
          try {
            updatedCuration = await builder.updateItemCurationStatus(item.id, CurationStatus.APPROVED)
            return updatedCuration
          } catch (error) {
            errors.push(new ThirdPartyCurationUpdateError(item))
          }
        } catch (error) {
          errors.push(new ThirdPartyDeploymentError(item))
        }
      } catch (error) {
        errors.push(new ThirdPartyBuildEntityError(item))
      }
      return Promise.resolve()
    })

    const deployedItemsCurations: ItemCuration[] = yield call([queue, 'addAll'], promisesOfItemsBeingDeployed)
    if (errors.length) {
      yield put(deployBatchedThirdPartyItemsFailure(errors))
    } else {
      yield put(deployBatchedThirdPartyItemsSuccess(collection, deployedItemsCurations))
    }
  }
}
