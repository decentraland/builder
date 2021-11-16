import { Contract, providers, constants } from 'ethers'
import { replace } from 'connected-react-router'
import { select, take, takeEvery, call, put, takeLatest, race, retry, delay } from 'redux-saga/effects'
import { CatalystClient, DeploymentPreparationData } from 'dcl-catalyst-client'
import { ChainId } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { Provider, Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { Network } from '@dcl/schemas'
import {
  FetchCollectionsRequestAction,
  fetchCollectionsRequest,
  fetchCollectionsSuccess,
  fetchCollectionsFailure,
  FETCH_COLLECTIONS_REQUEST,
  FETCH_COLLECTIONS_SUCCESS,
  FetchCollectionRequestAction,
  fetchCollectionSuccess,
  fetchCollectionFailure,
  FETCH_COLLECTION_REQUEST,
  SaveCollectionRequestAction,
  saveCollectionSuccess,
  saveCollectionFailure,
  SAVE_COLLECTION_REQUEST,
  DeleteCollectionRequestAction,
  deleteCollectionSuccess,
  deleteCollectionFailure,
  DELETE_COLLECTION_REQUEST,
  PublishCollectionRequestAction,
  publishCollectionSuccess,
  publishCollectionFailure,
  PUBLISH_COLLECTION_REQUEST,
  SetCollectionMintersRequestAction,
  setCollectionMintersSuccess,
  setCollectionMintersFailure,
  SET_COLLECTION_MINTERS_REQUEST,
  SetCollectionManagersRequestAction,
  setCollectionManagersSuccess,
  setCollectionManagersFailure,
  SET_COLLECTION_MANAGERS_REQUEST,
  MintCollectionItemsRequestAction,
  mintCollectionItemsSuccess,
  mintCollectionItemsFailure,
  MINT_COLLECTION_ITEMS_REQUEST,
  ApproveCollectionRequestAction,
  approveCollectionSuccess,
  approveCollectionFailure,
  APPROVE_COLLECTION_REQUEST,
  RejectCollectionRequestAction,
  rejectCollectionSuccess,
  rejectCollectionFailure,
  REJECT_COLLECTION_REQUEST,
  PUBLISH_COLLECTION_SUCCESS,
  saveCollectionRequest,
  SAVE_COLLECTION_SUCCESS,
  SAVE_COLLECTION_FAILURE,
  SaveCollectionFailureAction,
  SaveCollectionSuccessAction,
  INITIATE_APPROVAL_FLOW,
  InitiateApprovalFlowAction,
  APPROVE_COLLECTION_SUCCESS,
  APPROVE_COLLECTION_FAILURE,
  ApproveCollectionSuccessAction,
  ApproveCollectionFailureAction
} from './actions'
import { getMethodData, getWallet } from 'modules/wallet/utils'
import { buildCollectionForumPost } from 'modules/forum/utils'
import { createCollectionForumPostRequest } from 'modules/forum/actions'
import {
  setItemsTokenIdRequest,
  FETCH_ITEMS_SUCCESS,
  SAVE_ITEM_SUCCESS,
  SaveItemSuccessAction,
  RESCUE_ITEMS_SUCCESS,
  RESCUE_ITEMS_FAILURE,
  RescueItemsSuccessAction,
  RescueItemsFailureAction,
  fetchItemsRequest,
  FETCH_ITEMS_FAILURE
} from 'modules/item/actions'
import { areSynced, isValidText, toInitializeItems } from 'modules/item/utils'
import { locations } from 'routing/locations'
import { getCollectionId } from 'modules/location/selectors'
import { BuilderAPI } from 'lib/api/builder'
import { closeModal, CloseModalAction, CLOSE_MODAL, openModal } from 'modules/modal/actions'
import { Item } from 'modules/item/types'
import { getEntityByItemId, getItems, getCollectionItems, getWalletItems, getData as getItemsById } from 'modules/item/selectors'
import { getName } from 'modules/profile/selectors'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView } from 'components/Modals/ApprovalFlowModal/ApprovalFlowModal.types'
import { buildItemContentHash, buildItemEntity } from 'modules/item/export'
import { getCurationsByCollectionId } from 'modules/curation/selectors'
import {
  ApproveCurationFailureAction,
  approveCurationRequest,
  ApproveCurationSuccessAction,
  APPROVE_CURATION_FAILURE,
  APPROVE_CURATION_SUCCESS
} from 'modules/curation/actions'
import { Curation, CurationStatus } from 'modules/curation/types'
import {
  DeployEntitiesFailureAction,
  DeployEntitiesSuccessAction,
  DEPLOY_ENTITIES_FAILURE,
  DEPLOY_ENTITIES_SUCCESS
} from 'modules/entity/actions'
import { getCollection, getWalletCollections } from './selectors'
import { Collection } from './types'
import { isOwner, getCollectionBaseURI, getCollectionSymbol, isLocked, isThirdParty } from './utils'

export function* collectionSaga(builder: BuilderAPI, catalyst: CatalystClient) {
  yield takeEvery(FETCH_COLLECTIONS_REQUEST, handleFetchCollectionsRequest)
  yield takeEvery(FETCH_COLLECTION_REQUEST, handleFetchCollectionRequest)
  yield takeLatest(FETCH_COLLECTIONS_SUCCESS, handleRequestCollectionSuccess)
  yield takeEvery(SAVE_COLLECTION_REQUEST, handleSaveCollectionRequest)
  yield takeLatest(SAVE_COLLECTION_SUCCESS, handleSaveCollectionSuccess)
  yield takeLatest(SAVE_ITEM_SUCCESS, handleSaveItemSuccess)
  yield takeEvery(DELETE_COLLECTION_REQUEST, handleDeleteCollectionRequest)
  yield takeEvery(PUBLISH_COLLECTION_REQUEST, handlePublishCollectionRequest)
  yield takeEvery(SET_COLLECTION_MINTERS_REQUEST, handleSetCollectionMintersRequest)
  yield takeEvery(SET_COLLECTION_MANAGERS_REQUEST, handleSetCollectionManagersRequest)
  yield takeEvery(MINT_COLLECTION_ITEMS_REQUEST, handleMintCollectionItemsRequest)
  yield takeEvery(APPROVE_COLLECTION_REQUEST, handleApproveCollectionRequest)
  yield takeEvery(REJECT_COLLECTION_REQUEST, handleRejectCollectionRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(FETCH_TRANSACTION_SUCCESS, handleTransactionSuccess)
  yield takeLatest(INITIATE_APPROVAL_FLOW, handleInitiateApprovalFlow)

  function* handleFetchCollectionsRequest(action: FetchCollectionsRequestAction) {
    const { address } = action.payload
    try {
      const collections: Collection[] = yield call(() => builder.fetchCollections(address))
      yield put(fetchCollectionsSuccess(collections))
    } catch (error) {
      yield put(fetchCollectionsFailure(error.message))
    }
  }

  function* handleFetchCollectionRequest(action: FetchCollectionRequestAction) {
    const { id } = action.payload
    try {
      const collection: Collection = yield call(() => builder.fetchCollection(id))
      yield put(fetchCollectionSuccess(id, collection))
    } catch (error) {
      yield put(fetchCollectionFailure(id, error.message))
    }
  }

  function* handleSaveCollectionSuccess() {
    yield put(closeModal('CreateCollectionModal'))
    yield put(closeModal('CreateThirdPartyCollectionModal'))
    yield put(closeModal('EditCollectionURNModal'))
    yield put(closeModal('EditCollectionNameModal'))
  }

  function* handleSaveItemSuccess(action: SaveItemSuccessAction) {
    const { item } = action.payload
    if (item.collectionId && !item.isPublished) {
      const collection: Collection = yield select(state => getCollection(state, item.collectionId!))
      yield put(saveCollectionRequest(collection))
    }
  }

  function* handleSaveCollectionRequest(action: SaveCollectionRequestAction) {
    const { collection } = action.payload
    try {
      if (!isValidText(collection.name)) {
        throw new Error(yield call(t, 'sagas.collection.invalid_character'))
      }
      if (isLocked(collection)) {
        throw new Error(yield call(t, 'sagas.collection.collection_locked'))
      }

      let data: string = ''

      if (!isThirdParty(collection)) {
        const items: Item[] = yield select(state => getCollectionItems(state, collection.id))
        const from: string = yield select(getAddress)
        const maticChainId = getChainIdByNetwork(Network.MATIC)
        const rarities = getContract(ContractName.Rarities, maticChainId)
        const { abi } = getContract(ContractName.ERC721CollectionV2, maticChainId)

        const provider: Provider = yield call(getNetworkProvider, maticChainId)
        const collectionV2 = new Contract(
          constants.AddressZero, // using zero address here since we just want the implementation of the ERC721CollectionV2 to generate the `data` of the initialize method
          abi,
          new providers.Web3Provider(provider)
        )
        data = yield call(
          getMethodData,
          collectionV2.populateTransaction.initialize(
            collection.name,
            getCollectionSymbol(collection),
            getCollectionBaseURI(),
            from,
            true, // should complete
            false, // is approved
            rarities.address,
            toInitializeItems(items)
          )
        )
      }

      const remoteCollection: Collection = yield call([builder, 'saveCollection'], collection, data)
      const newCollection = { ...collection, ...remoteCollection }

      yield put(saveCollectionSuccess(newCollection))
    } catch (error) {
      yield put(saveCollectionFailure(collection, error.message))
    }
  }

  function* handleDeleteCollectionRequest(action: DeleteCollectionRequestAction) {
    const { collection } = action.payload
    try {
      yield call(() => builder.deleteCollection(collection))
      yield put(deleteCollectionSuccess(collection))
      const collectionIdInUriParam: string = yield select(getCollectionId)
      if (collectionIdInUriParam === collection.id) {
        yield put(replace(locations.collections()))
      }
    } catch (error) {
      yield put(deleteCollectionFailure(collection, error.message))
    }
  }

  function* handlePublishCollectionRequest(action: PublishCollectionRequestAction) {
    let { collection, items, email } = action.payload
    try {
      if (!isLocked(collection)) {
        // To ensure the contract address of the collection is correct, we pre-emptively save it to the server and store the response.
        // This will re-generate the address and any other data generated on the server (like the salt) before actually publishing it.
        // We skip this step if the collection is locked to avoid an error from the server while trying to save the collection
        yield put(saveCollectionRequest(collection))

        const saveCollection: {
          success: SaveCollectionSuccessAction
          failure: SaveCollectionFailureAction
        } = yield race({
          success: take(SAVE_COLLECTION_SUCCESS),
          failure: take(SAVE_COLLECTION_FAILURE)
        })

        if (saveCollection.success) {
          collection = saveCollection.success.payload.collection
        } else {
          throw new Error(saveCollection.failure.payload.error)
        }
      }

      if (!collection.salt) {
        throw new Error(yield call(t, 'sagas.item.missing_salt'))
      }

      const from: string = yield select(getAddress)
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)

      const forwarder = getContract(ContractName.Forwarder, maticChainId)
      const factory = getContract(ContractName.CollectionFactory, maticChainId)
      const manager = getContract(ContractName.CollectionManager, maticChainId)

      // We wait for TOS to end first to avoid locking the collection preemptively if this endpoint fails
      yield retry(10, 500, builder.saveTOS, collection, email)

      const txHash: string = yield call(sendTransaction, manager, collectionManager =>
        collectionManager.createCollection(
          forwarder.address,
          factory.address,
          collection.salt!,
          collection.name,
          getCollectionSymbol(collection),
          getCollectionBaseURI(),
          from,
          toInitializeItems(items)
        )
      )

      // TODO: uncomment this and add feature flag once we have support for them
      // const lock: string = yield retry(10, 500, builder.lockCollection, collection)
      // collection = { ...collection, lock: +new Date(lock) }

      yield put(publishCollectionSuccess(collection, items, maticChainId, txHash))
      yield put(replace(locations.activity()))
    } catch (error) {
      yield put(publishCollectionFailure(collection, items, error.message))
    }
  }

  function* handleSetCollectionMintersRequest(action: SetCollectionMintersRequestAction) {
    const { collection, accessList } = action.payload
    try {
      const maticChainId = getChainIdByNetwork(Network.MATIC)

      const addresses: string[] = []
      const values: boolean[] = []

      const newMinters = new Set(collection.minters)

      for (const { address, hasAccess } of accessList) {
        addresses.push(address)
        values.push(hasAccess)

        if (hasAccess) {
          newMinters.add(address)
        } else {
          newMinters.delete(address)
        }
      }

      const contract = { ...getContract(ContractName.ERC721CollectionV2, maticChainId), address: collection.contractAddress! }
      const txHash: string = yield sendTransaction(contract, collection => collection.setMinters(addresses, values))

      yield put(setCollectionMintersSuccess(collection, Array.from(newMinters), maticChainId, txHash))
      yield put(replace(locations.activity()))
    } catch (error) {
      yield put(setCollectionMintersFailure(collection, accessList, error.message))
    }
  }

  function* handleSetCollectionManagersRequest(action: SetCollectionManagersRequestAction) {
    const { collection, accessList } = action.payload
    try {
      const maticChainId = getChainIdByNetwork(Network.MATIC)

      const addresses: string[] = []
      const values: boolean[] = []

      const newManagers = new Set(collection.managers)

      for (const { address, hasAccess } of accessList) {
        addresses.push(address)
        values.push(hasAccess)

        if (hasAccess) {
          newManagers.add(address)
        } else {
          newManagers.delete(address)
        }
      }

      const contract = { ...getContract(ContractName.ERC721CollectionV2, maticChainId), address: collection.contractAddress! }
      const txHash: string = yield call(sendTransaction, contract, collection => collection.setManagers(addresses, values))

      yield put(setCollectionManagersSuccess(collection, Array.from(newManagers), maticChainId, txHash))
      yield put(replace(locations.activity()))
    } catch (error) {
      yield put(setCollectionManagersFailure(collection, accessList, error.message))
    }
  }

  function* handleMintCollectionItemsRequest(action: MintCollectionItemsRequestAction) {
    const { collection, mints } = action.payload
    try {
      const maticChainId = getChainIdByNetwork(Network.MATIC)

      const beneficiaries: string[] = []
      const tokenIds: string[] = []

      for (const mint of mints) {
        const beneficiary = mint.address
        for (let i = 0; i < mint.amount; i++) {
          beneficiaries.push(beneficiary)
          tokenIds.push(mint.item.tokenId!)
        }
      }

      const contract = { ...getContract(ContractName.ERC721CollectionV2, maticChainId), address: collection.contractAddress! }
      const txHash: string = yield call(sendTransaction, contract, collection => collection.issueTokens(beneficiaries, tokenIds))

      yield put(mintCollectionItemsSuccess(collection, mints, maticChainId, txHash))
      yield put(closeModal('MintItemsModal'))
      yield put(replace(locations.activity()))
    } catch (error) {
      yield put(mintCollectionItemsFailure(collection, mints, error.message))
    }
  }

  function* handleApproveCollectionRequest(action: ApproveCollectionRequestAction) {
    const { collection } = action.payload
    try {
      const txHash: string = yield changeCollectionStatus(collection, true)
      yield put(approveCollectionSuccess(collection, getChainIdByNetwork(Network.MATIC), txHash))
    } catch (error) {
      yield put(approveCollectionFailure(collection, error.message))
    }
  }

  function* handleRejectCollectionRequest(action: RejectCollectionRequestAction) {
    const { collection } = action.payload
    try {
      const [wallet]: [Wallet] = yield getWallet()
      const maticChainId = wallet.networks.MATIC.chainId

      const txHash: string = yield changeCollectionStatus(collection, false)
      yield put(rejectCollectionSuccess(collection, maticChainId, txHash))
    } catch (error) {
      yield put(rejectCollectionFailure(collection, error.message))
    }
  }

  function* handleLoginSuccess(action: LoginSuccessAction) {
    const { wallet } = action.payload
    yield put(fetchCollectionsRequest(wallet.address))
  }

  function* handleRequestCollectionSuccess() {
    let allItems: Item[] = yield select(getWalletItems)
    if (allItems.length === 0) {
      yield take(FETCH_ITEMS_SUCCESS)
      allItems = yield select(getWalletItems)
    }

    try {
      const collections: Collection[] = yield select(getWalletCollections)

      for (const collection of collections) {
        if (!collection.isPublished) continue
        yield finishCollectionPublishing(collection)
      }
    } catch (error) {
      console.error(error)
    }
  }

  function* handleTransactionSuccess(action: FetchTransactionSuccessAction) {
    const transaction = action.payload.transaction

    try {
      switch (transaction.actionType) {
        case PUBLISH_COLLECTION_SUCCESS: {
          // We re-fetch the collection from the store to get the updated version
          const collectionId = transaction.payload.collection.id
          const collection: Collection = yield select(state => getCollection(state, collectionId))
          yield finishCollectionPublishing(collection)
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

  /**
   * Proccesses a collection that was published to the blockchain by singaling the
   * builder server that the collecton has been published, setting the item ids,
   * deploys the item entities to the Catalyst server and creates the forum post.
   *
   * @param collection - The collection to post process.
   */
  function* finishCollectionPublishing(collection: Collection) {
    const avatarName: string | null = yield select(getName)
    const items: Item[] = yield select(state => getCollectionItems(state, collection.id))

    yield publishCollection(collection, items)

    if (!collection.forumLink) {
      yield put(createCollectionForumPostRequest(collection, buildCollectionForumPost(collection, items, avatarName || '')))
    }
  }

  /**
   * Publishes a collection, establishing ids for the items and their blockchain ids.
   *
   * @param collection - The collection that owns the items to be set as published.
   * @param items - The items to be set as published.
   */
  function* publishCollection(collection: Collection, items: Item[]) {
    const address: string | undefined = yield select(getAddress)
    if (!isOwner(collection, address)) {
      return
    }

    if (items.some(item => !item.tokenId)) {
      yield put(setItemsTokenIdRequest(collection, items))
    }
  }

  function* changeCollectionStatus(collection: Collection, isApproved: boolean) {
    const maticChainId = getChainIdByNetwork(Network.MATIC)
    const contract = getContract(ContractName.Committee, maticChainId)

    const { abi } = getContract(ContractName.ERC721CollectionV2, maticChainId)
    const implementation = new Contract(collection.contractAddress!, abi)

    const manager = getContract(ContractName.CollectionManager, maticChainId)
    const forwarder = getContract(ContractName.Forwarder, maticChainId)
    const data: string = yield call(getMethodData, implementation.populateTransaction.setApproved(isApproved))

    const txHash: string = yield call(sendTransaction, contract, committee =>
      committee.manageCollection(manager.address, forwarder.address, collection.contractAddress!, [data])
    )
    return txHash
  }

  function* getItemsFromCollection(collection: Collection) {
    const allItems: Item[] = yield select(getItems)
    return allItems.filter(item => item.collectionId === collection.id)
  }

  function* handleInitiateApprovalFlow(action: InitiateApprovalFlowAction) {
    const { collection } = action.payload

    try {
      if (!collection.isPublished) {
        throw new Error(`The collection can't be approved because it's not published`)
      }

      // 1. Open modal
      const modalMetadata: ApprovalFlowModalMetadata<ApprovalFlowModalView.LOADING> = {
        view: ApprovalFlowModalView.LOADING,
        collection
      }
      yield put(openModal('ApprovalFlowModal', modalMetadata))

      // 2. Find items that need to be rescued (their content hash needs to be updated)
      const itemsToRescue: Item[] = []
      const contentHashes: string[] = []
      for (const item of yield getItemsFromCollection(collection)) {
        const contentHash: string = yield call(buildItemContentHash, collection, item)
        if (item.contentHash !== contentHash) {
          itemsToRescue.push(item)
          contentHashes.push(contentHash)
        }
      }

      // 3. If any, open the modal in the rescue step and wait for actions
      if (itemsToRescue.length > 0) {
        const modalMetadata: ApprovalFlowModalMetadata<ApprovalFlowModalView.RESCUE> = {
          view: ApprovalFlowModalView.RESCUE,
          collection,
          items: itemsToRescue,
          contentHashes
        }
        yield put(openModal('ApprovalFlowModal', modalMetadata))

        // Wait for actions...
        const {
          success,
          failure,
          cancel
        }: { success: RescueItemsSuccessAction; failure: RescueItemsFailureAction; cancel: CloseModalAction } = yield race({
          success: take(RESCUE_ITEMS_SUCCESS),
          failure: take(RESCUE_ITEMS_FAILURE),
          cancel: take(CLOSE_MODAL)
        })

        // If success wait for tx to be mined
        if (success) {
          // Wait for contentHashes to be indexed
          yield waitForIndexer(itemsToRescue, contentHashes)

          // If failure show error and exit flow
        } else if (failure) {
          throw new Error(failure.payload.error)

          // If cancel exit flow
        } else if (cancel) {
          return
        }
      }

      // 4. Find items that need to be deployed (the content in the catalyst doesn't match their content hash in the blockchain)
      const itemsToDeploy: Item[] = []
      const entitiesToDeploy: DeploymentPreparationData[] = []
      const entitiesByItemId: ReturnType<typeof getEntityByItemId> = yield select(getEntityByItemId)
      for (const item of yield getItemsFromCollection(collection)) {
        const deployedEntity = entitiesByItemId[item.id]
        if (!deployedEntity || !areSynced(item, deployedEntity)) {
          const entity: DeploymentPreparationData = yield call(buildItemEntity, catalyst, collection, item)
          itemsToDeploy.push(item)
          entitiesToDeploy.push(entity)
        }
      }

      // 5. If any, open the modal in the DEPLOY step and wait for actions
      if (itemsToDeploy.length > 0) {
        const modalMetadata: ApprovalFlowModalMetadata<ApprovalFlowModalView.DEPLOY> = {
          view: ApprovalFlowModalView.DEPLOY,
          collection,
          items: itemsToDeploy,
          entities: entitiesToDeploy
        }
        yield put(openModal('ApprovalFlowModal', modalMetadata))

        // Wait for actions...
        const {
          failure,
          cancel
        }: { success: DeployEntitiesSuccessAction; failure: DeployEntitiesFailureAction; cancel: CloseModalAction } = yield race({
          success: take(DEPLOY_ENTITIES_SUCCESS),
          failure: take(DEPLOY_ENTITIES_FAILURE),
          cancel: take(CLOSE_MODAL)
        })

        // If failure show error and exit flow
        if (failure) {
          throw new Error(failure.payload.error)

          // If cancel exit flow
        } else if (cancel) {
          return
        }
      }

      // 6. If the collection needs to be approved, show the approve modal
      if (!collection.isApproved) {
        const modalMetadata: ApprovalFlowModalMetadata<ApprovalFlowModalView.APPROVE> = { view: ApprovalFlowModalView.APPROVE, collection }
        yield put(openModal('ApprovalFlowModal', modalMetadata))

        // Wait for actions...
        const {
          failure,
          cancel
        }: { success: ApproveCollectionSuccessAction; failure: ApproveCollectionFailureAction; cancel: CloseModalAction } = yield race({
          success: take(APPROVE_COLLECTION_SUCCESS),
          failure: take(APPROVE_COLLECTION_FAILURE),
          cancel: take(CLOSE_MODAL)
        })

        // iI failure show error and exit flow
        if (failure) {
          throw new Error(failure.payload.error)

          // if cancel exit flow
        } else if (cancel) {
          return
        }
      } else {
        // 7. If the collection was approved but it had a pending curation, approve the curation
        const curationsByCollectionId: Record<string, Curation> = yield select(getCurationsByCollectionId)
        const curation = curationsByCollectionId[collection.id]
        if (curation && curation.status === CurationStatus.PENDING) {
          yield put(approveCurationRequest(curation.collectionId))

          // wait for actions
          const { failure }: { success: ApproveCurationSuccessAction; failure: ApproveCurationFailureAction } = yield race({
            success: take(APPROVE_CURATION_SUCCESS),
            failure: take(APPROVE_CURATION_FAILURE)
          })

          // if failure show error
          if (failure) {
            const modalMetadata: ApprovalFlowModalMetadata<ApprovalFlowModalView.ERROR> = {
              view: ApprovalFlowModalView.ERROR,
              collection,
              error: failure.payload.error
            }
            yield put(openModal('ApprovalFlowModal', modalMetadata))
            return
          }
        }
      }

      // 8. Success 🎉
      yield put(
        openModal('ApprovalFlowModal', {
          view: ApprovalFlowModalView.SUCCESS,
          collection
        })
      )
    } catch (error) {
      // Handle error at any point in the flow and show them
      const modalMetadata: ApprovalFlowModalMetadata<ApprovalFlowModalView.ERROR> = {
        view: ApprovalFlowModalView.ERROR,
        collection,
        error: error.message
      }
      yield put(openModal('ApprovalFlowModal', modalMetadata))
    }
  }

  function* waitForIndexer(items: Item[], contentHashes: string[]) {
    const contentHashByItemId = new Map<string, string>()
    for (let i = 0; i < items.length; i++) {
      contentHashByItemId.set(items[i].id, contentHashes[i])
    }
    let isIndexed = false
    const itemIds = items.map(item => item.id)
    while (!isIndexed) {
      yield delay(1000)
      yield put(fetchItemsRequest())
      yield race({
        success: take(FETCH_ITEMS_SUCCESS),
        failure: take(FETCH_ITEMS_FAILURE)
      })
      // use items from state (updated after the fetchItemsSuccess)
      const itemsById: ReturnType<typeof getItemsById> = yield select(getItemsById)
      isIndexed = itemIds.every(id => {
        const indexedContentHash = itemsById[id].contentHash
        const expectedContentHash = contentHashByItemId.get(id)
        return indexedContentHash === expectedContentHash
      })
    }
  }
}
