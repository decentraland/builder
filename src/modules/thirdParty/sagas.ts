import PQueue from 'p-queue'
import { channel } from 'redux-saga'
import { takeLatest, takeEvery, call, put, select, race, take, retry } from 'redux-saga/effects'
import { Contract, ethers, providers } from 'ethers'
import { Authenticator, AuthIdentity } from '@dcl/crypto'
import { ChainId, Network } from '@dcl/schemas'
import { CatalystClient } from 'dcl-catalyst-client'
import { DeploymentPreparationData } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { CLOSE_MODAL, closeModal, CloseModalAction, openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { showToast } from 'decentraland-dapps/dist/modules/toast/actions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { ToastType } from 'decentraland-ui'
import { BuilderAPI, TermsOfServiceEvent } from 'lib/api/builder'
import { ApprovalFlowModalView } from 'components/Modals/ApprovalFlowModal/ApprovalFlowModal.types'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Item } from 'modules/item/types'
import { updateThirdPartyActionProgress } from 'modules/ui/thirdparty/action'
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
import { ThirdPartyAction, PublishThirdPartyCollectionModalStep } from 'modules/ui/thirdparty/types'
import { getCollection } from 'modules/collection/selectors'
import { FETCH_COLLECTION_FAILURE, FETCH_COLLECTION_SUCCESS, fetchCollectionRequest } from 'modules/collection/actions'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import { getIsLinkedWearablesPaymentsEnabled } from 'modules/features/selectors'
import { subscribeToNewsletterRequest } from 'modules/newsletter/action'
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
  DeployBatchedThirdPartyItemsRequestAction,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
  DISABLE_THIRD_PARTY_REQUEST,
  DisableThirdPartyRequestAction,
  disableThirdPartyFailure,
  disableThirdPartySuccess,
  FETCH_THIRD_PARTY_REQUEST,
  FetchThirdPartyRequestAction,
  fetchThirdPartySuccess,
  fetchThirdPartyFailure,
  PublishAndPushChangesThirdPartyItemsSuccessAction,
  finishPublishAndPushChangesThirdPartyItemsSuccess,
  finishPublishAndPushChangesThirdPartyItemsFailure,
  FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
  FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
  clearThirdPartyErrors,
  SetThirdPartyTypeRequestAction,
  SET_THIRD_PARTY_KIND_REQUEST,
  setThirdPartyKindFailure,
  setThirdPartyKindSuccess
} from './actions'
import { convertThirdPartyMetadataToRawMetadata, getPublishItemsSignature } from './utils'
import { Cheque, ThirdParty } from './types'
import { getThirdParty } from './selectors'

export function* getContractInstance(
  contract: ContractName.ThirdPartyRegistry | ContractName.ChainlinkOracle,
  chainId: ChainId,
  provider: providers.ExternalProvider
) {
  const contractData: ContractData = yield call(getContract, contract, chainId)
  const contractInstance = new Contract(contractData.address, contractData.abi, new providers.Web3Provider(provider))
  return contractInstance
}

export function* thirdPartySaga(builder: BuilderAPI, catalystClient: CatalystClient) {
  const actionProgressChannel = channel()
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST, handleDeployBatchedThirdPartyItemsRequest)
  yield takeEvery(FETCH_THIRD_PARTIES_REQUEST, handleFetchThirdPartiesRequest)
  yield takeEvery(FETCH_THIRD_PARTY_REQUEST, handleFetchThirdPartyRequest)
  yield takeEvery(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST, handleFetchThirdPartyAvailableSlots)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_REQUEST, handlePublishThirdPartyItemRequest)
  yield takeEvery(PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS, handlePublishAndPushChangesThirdPartyItemSuccess)
  yield takeEvery(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, handlePublishAndPushChangesThirdPartyItemRequest)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_SUCCESS, handlePublishThirdPartyItemSuccess)
  yield takeLatest(REVIEW_THIRD_PARTY_REQUEST, handleReviewThirdPartyRequest)
  yield takeEvery(DISABLE_THIRD_PARTY_REQUEST, handleDisableThirdPartyRequest)
  yield takeEvery(SET_THIRD_PARTY_KIND_REQUEST, handleSetThirdPartyKind)
  yield takeEvery(actionProgressChannel, handleUpdateApprovalFlowProgress)
  yield takeEvery(
    [
      PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
      PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
      FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
      FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
      PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
      PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE
    ],
    resetThirdPartyProgressAction
  )
  yield takeEvery(CLOSE_MODAL, handleCloseModal)

  function* handleCloseModal(action: CloseModalAction) {
    if (action.payload.name === 'PublishWizardCollectionModal' || action.payload.name === 'PushChangesModal') {
      yield put(clearThirdPartyErrors())
    }
  }

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
      yield put(fetchThirdPartiesFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchThirdPartyRequest(action: FetchThirdPartyRequestAction) {
    const { thirdPartyId } = action.payload
    try {
      const thirdParty: ThirdParty = yield call([builder, 'fetchThirdParty'], thirdPartyId)
      yield put(fetchThirdPartySuccess(thirdParty))
    } catch (error) {
      yield put(fetchThirdPartyFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchThirdPartyAvailableSlots(action: FetchThirdPartyAvailableSlotsRequestAction) {
    const { thirdPartyId } = action.payload
    try {
      const availableSlots: number = yield call([builder, 'fetchThirdPartyAvailableSlots'], thirdPartyId)
      yield put(fetchThirdPartyAvailableSlotsSuccess(thirdPartyId, availableSlots))
    } catch (error) {
      yield put(fetchThirdPartyAvailableSlotsFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
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

  function* publishChangesToThirdPartyItems(thirdParty: ThirdParty, items: Item[], cheque?: Cheque) {
    const collectionId = getCollectionId(items)
    const { signature, salt, qty } = cheque ?? (yield call(getPublishItemsSignature, thirdParty.id, items.length))

    const { items: newItems, itemCurations: newItemCurations }: { items: Item[]; itemCurations: ItemCuration[] } = yield retry(
      20,
      5000,
      builder.publishTPCollection,
      collectionId,
      items.map(i => i.id),
      {
        signature,
        qty,
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
      yield put(
        openModal('PublishThirdPartyCollectionModal', {
          collectionId,
          itemIds: [],
          action: PublishButtonAction.NONE,
          step: PublishThirdPartyCollectionModalStep.SUCCESS
        })
      )
    } catch (error) {
      yield showActionErrorToast()
      yield put(publishThirdPartyItemsFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
      yield put(closeModal('PublishThirdPartyCollectionModal'))
    }
  }

  function* resetThirdPartyProgressAction() {
    yield actionProgressChannel.put({
      progress: 0,
      tpAction: ThirdPartyAction.PUSH_CHANGES
    })
  }

  function* pushChangesToThirdPartyItems(items: Item[]) {
    const collectionId = getCollectionId(items)

    const itemCurations: ItemCuration[] = yield select(getItemCurations, collectionId)
    const MAX_CONCURRENT_REQUESTS = 3
    const queue = new PQueue({ concurrency: MAX_CONCURRENT_REQUESTS })
    const promisesOfItemsBeingUpdated: (() => Promise<ItemCuration>)[] = items.map((item: Item) => {
      const curation = itemCurations.find(itemCuration => itemCuration.itemId === item.id)
      actionProgressChannel.put({
        progress: Math.round(((items.length - (queue.size + queue.pending)) / items.length) * 100),
        tpAction: ThirdPartyAction.PUSH_CHANGES
      })
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
      const collection: ReturnType<typeof getCollection> = yield select(getCollection, collectionId)
      const newItemsCurations: ItemCuration[] = yield call(pushChangesToThirdPartyItems, items)
      // Update collections that are not complete
      if (!collection?.isMappingComplete) {
        yield put(fetchCollectionRequest(collectionId))
        yield race({ success: take(FETCH_COLLECTION_SUCCESS), failure: take(FETCH_COLLECTION_FAILURE) })
      }
      yield put(pushChangesThirdPartyItemsSuccess(collectionId, newItemsCurations))
      yield put(
        openModal('PublishThirdPartyCollectionModal', {
          collectionId,
          itemIds: [],
          action: PublishButtonAction.NONE,
          step: PublishThirdPartyCollectionModalStep.SUCCESS
        })
      )
    } catch (error) {
      yield showActionErrorToast()
      yield put(pushChangesThirdPartyItemsFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
      yield put(closeModal('PublishThirdPartyCollectionModal'))
    }
  }

  function* handlePublishAndPushChangesThirdPartyItemRequest(action: PublishAndPushChangesThirdPartyItemsRequestAction) {
    const { thirdParty, minSlots, maxSlotPrice, itemsToPublish, itemsWithChanges, email, subscribeToNewsletter, cheque } = action.payload
    const collectionId = itemsToPublish.length > 0 ? getCollectionId(itemsToPublish) : getCollectionId(itemsWithChanges)
    const collection: ReturnType<typeof getCollection> = yield select(getCollection, collectionId)
    const isLinkedWearablesPaymentsEnabled = (yield select(getIsLinkedWearablesPaymentsEnabled)) as ReturnType<
      typeof getIsLinkedWearablesPaymentsEnabled
    >

    // We need to execute these two methods in sequence, because the push changes will create a new curation if there was one already approved.
    // It will create them with status PENDING, so the publish will fail if it's executed after that event.
    // Publish items
    try {
      if (!collection) {
        throw new Error('Collection not found')
      }

      if (email) {
        // Save the ToS with all the item hashes published or pushed
        const allItemsHashes = itemsToPublish
          .concat(itemsWithChanges)
          .map(item => item.currentContentHash)
          .filter(Boolean) as string[]
        yield retry(10, 500, builder.saveTOS, TermsOfServiceEvent.PUBLISH_THIRD_PARTY_ITEMS, collection, email, allItemsHashes)
      }

      if (subscribeToNewsletter && email) {
        yield put(subscribeToNewsletterRequest(email, 'Builder Wearables creator'))
      }

      if (thirdParty.availableSlots === undefined) {
        throw new Error('Third party available slots must be defined before publishing')
      }
      const missingSlots = itemsToPublish.length - thirdParty.availableSlots
      let txHash: string | undefined
      let maticChainId: ChainId | undefined

      // There are items to publish and there are available slots
      if (itemsToPublish.length > 0 && missingSlots > 0 && isLinkedWearablesPaymentsEnabled) {
        if (!maxSlotPrice) {
          throw new Error('Max slot price must be defined')
        }

        maticChainId = (yield call(getChainIdByNetwork, Network.MATIC)) as ChainId
        const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
        // If the third party has not been published before create a new one with the required slots
        if (!thirdParty.published) {
          let slotsToPublish: string
          if (thirdParty.isProgrammatic) {
            // When publishing a programmatic third party collection, we need to publish the maximum number between the
            // missing slots and the minimum amount of slots required to publish a programmatic third party.
            slotsToPublish = ethers.BigNumber.from(missingSlots).gt(minSlots ?? '0')
              ? missingSlots.toString()
              : (minSlots ?? '0').toString()
          } else {
            slotsToPublish = missingSlots.toString()
          }

          txHash = yield call(
            sendTransaction as any,
            thirdPartyContract,
            'addThirdParties',
            [
              [
                thirdParty.id,
                convertThirdPartyMetadataToRawMetadata(thirdParty.name, thirdParty.description, thirdParty.contracts),
                'Disabled',
                thirdParty.managers,
                Array.from({ length: thirdParty.managers.length }, () => true),
                slotsToPublish
              ]
            ],
            [thirdParty.isProgrammatic],
            [maxSlotPrice]
          )
        } else {
          // If the third party has already been published, just buy the needed slots
          txHash = yield call(
            sendTransaction as any,
            thirdPartyContract,
            'buyItemSlots',
            thirdParty.id,
            missingSlots.toString(),
            maxSlotPrice
          )
        }
      }

      yield put(
        publishAndPushChangesThirdPartyItemsSuccess(thirdParty, collection, itemsToPublish, itemsWithChanges, cheque, txHash, maticChainId)
      )
    } catch (error) {
      yield put(publishAndPushChangesThirdPartyItemsFailure(isErrorWithMessage(error) ? error.message : 'Unknown error')) // TODO: show to the user that something went wrong
      if (!isLinkedWearablesPaymentsEnabled) {
        yield showActionErrorToast()
        yield put(closeModal('PublishThirdPartyCollectionModal'))
      }
    }
  }

  function* handlePublishAndPushChangesThirdPartyItemSuccess(action: PublishAndPushChangesThirdPartyItemsSuccessAction) {
    const { thirdParty, collection, cheque, itemsToPublish, itemsWithChanges, txHash } = action.payload

    const isLinkedWearablesPaymentsEnabled = (yield select(getIsLinkedWearablesPaymentsEnabled)) as ReturnType<
      typeof getIsLinkedWearablesPaymentsEnabled
    >

    try {
      // If a transaction was performed, wait for it to be completed
      if (txHash) {
        yield call(waitForTx, txHash)
      }

      if (!thirdParty.published) {
        // Retry the request several items until the graph is updated
        yield retry(20, 5000, builder.deleteVirtualThirdParty, thirdParty.id)
      }

      let resultFromPublish: { newItems: Item[]; newItemCurations: ItemCuration[] } = { newItems: [], newItemCurations: [] }
      if (itemsToPublish.length > 0) {
        // Retry the request several items until the graph is updated
        resultFromPublish = yield call(publishChangesToThirdPartyItems, thirdParty, itemsToPublish, cheque)
      }

      const resultFromPushChanges: ItemCuration[] =
        itemsWithChanges.length > 0 ? yield call(pushChangesToThirdPartyItems, itemsWithChanges) : []
      const newItemCurations = [...resultFromPublish.newItemCurations, ...resultFromPushChanges]

      // Update collections that are not complete or that are published for the first time
      if (!collection?.isMappingComplete || !collection?.isPublished) {
        yield put(fetchCollectionRequest(collection.id))
        yield race({ success: take(FETCH_COLLECTION_SUCCESS), failure: take(FETCH_COLLECTION_FAILURE) })
      }

      if (!isLinkedWearablesPaymentsEnabled) {
        yield put(
          openModal('PublishThirdPartyCollectionModal', {
            collectionId: collection.id,
            itemIds: [],
            action: PublishButtonAction.NONE,
            step: PublishThirdPartyCollectionModalStep.SUCCESS
          })
        )
      }

      // If the collection was already published, don't show the modal success message, just close the modal
      if (isLinkedWearablesPaymentsEnabled && collection.isPublished) {
        yield put(closeModal('PublishWizardCollectionModal'))
      }

      // If we're only pushing changes, close the push changes modal
      if (isLinkedWearablesPaymentsEnabled && itemsToPublish.length === 0 && itemsWithChanges.length > 0) {
        yield put(closeModal('PushChangesModal'))
      }

      // Only fetch the third party slots if we're publishing new items
      if (itemsToPublish.length > 0) {
        yield put(fetchThirdPartyAvailableSlotsRequest(thirdParty.id)) // re-fetch available slots after publishing
      }
      yield put(finishPublishAndPushChangesThirdPartyItemsSuccess(thirdParty, collection.id, newItemCurations))
    } catch (error) {
      yield put(finishPublishAndPushChangesThirdPartyItemsFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
      if (!isLinkedWearablesPaymentsEnabled) {
        yield showActionErrorToast()
        yield put(closeModal('PublishThirdPartyCollectionModal'))
      }
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
      yield put(reviewThirdPartyFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleUpdateApprovalFlowProgress(action: { progress: number; tpAction: ThirdPartyAction }) {
    yield put(updateThirdPartyActionProgress(action.progress, action.tpAction))
  }

  function* handleDeployBatchedThirdPartyItemsRequest(action: DeployBatchedThirdPartyItemsRequestAction) {
    const { items, collection, tree, hashes } = action.payload
    const REQUESTS_BATCH_SIZE = 5

    const queue = new PQueue({ concurrency: REQUESTS_BATCH_SIZE })
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
        entity = await buildTPItemEntity(builder, collection, item, tree, hashes[item.id])
        try {
          const contentClient = await catalystClient.getContentClient()
          await contentClient.deploy({ ...entity, authChain: Authenticator.signPayload(identity, entity.entityId) })
          actionProgressChannel.put({
            progress: Math.round(((items.length - (queue.size + queue.pending)) / items.length) * 100),
            tpAction: ThirdPartyAction.APPROVE_COLLECTION
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

  function* handleDisableThirdPartyRequest(action: DisableThirdPartyRequestAction) {
    const { thirdPartyId } = action.payload
    try {
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const thirdParty: ThirdParty | null = yield select(getThirdParty, thirdPartyId)
      const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
      const txHash: string = yield call(sendTransaction as any, thirdPartyContract, 'reviewThirdParties', [[thirdPartyId, false, []]])
      yield put(disableThirdPartySuccess(thirdPartyId, maticChainId, txHash, thirdParty?.name ?? 'Unknown Third Party Name'))
    } catch (error) {
      yield put(disableThirdPartyFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleSetThirdPartyKind(action: SetThirdPartyTypeRequestAction) {
    const { thirdPartyId, isProgrammatic } = action.payload
    try {
      yield call([builder, 'setThirdPartyKind'], thirdPartyId, isProgrammatic)
      yield put(setThirdPartyKindSuccess(thirdPartyId, isProgrammatic))
      yield put(closeModal('CreateAndEditMultipleItemsModal'))
    } catch (error) {
      yield put(setThirdPartyKindFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }
}
