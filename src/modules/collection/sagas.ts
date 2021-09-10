import { Contract, providers } from 'ethers'
import { replace } from 'connected-react-router'
import { select, take, takeEvery, call, put, takeLatest, race, retry } from 'redux-saga/effects'
import { ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { Provider, Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
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
  SaveCollectionSuccessAction
} from './actions'
import { getMethodData, getWallet } from 'modules/wallet/utils'
import { buildCollectionForumPost } from 'modules/forum/utils'
import { createCollectionForumPostRequest } from 'modules/forum/actions'
import {
  setItemsTokenIdRequest,
  deployItemContentsRequest,
  FETCH_ITEMS_SUCCESS,
  SAVE_ITEM_SUCCESS,
  SaveItemSuccessAction
} from 'modules/item/actions'
import { isValidText } from 'modules/item/utils'
import { locations } from 'routing/locations'
import { getCollectionId } from 'modules/location/selectors'
import { builder } from 'lib/api/builder'
import { closeModal } from 'modules/modal/actions'
import { Item } from 'modules/item/types'
import { getWalletItems } from 'modules/item/selectors'
import { getWalletCollections } from 'modules/collection/selectors'
import { getName } from 'modules/profile/selectors'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { getCollection, getCollectionItems } from './selectors'
import { Collection } from './types'
import { isOwner, getCollectionBaseURI, getCollectionSymbol, toInitializeItems } from './utils'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { Network } from '@dcl/schemas'

export function* collectionSaga() {
  yield takeEvery(FETCH_COLLECTIONS_REQUEST, handleFetchCollectionsRequest)
  yield takeEvery(FETCH_COLLECTION_REQUEST, handleFetchCollectionRequest)
  yield takeLatest(FETCH_COLLECTIONS_SUCCESS, handleRequestCollectionSuccess)
  yield takeLatest(SAVE_ITEM_SUCCESS, handleSaveItemSuccess)
  yield takeEvery(SAVE_COLLECTION_REQUEST, handleSaveCollectionRequest)
  yield takeEvery(DELETE_COLLECTION_REQUEST, handleDeleteCollectionRequest)
  yield takeEvery(PUBLISH_COLLECTION_REQUEST, handlePublishCollectionRequest)
  yield takeEvery(SET_COLLECTION_MINTERS_REQUEST, handleSetCollectionMintersRequest)
  yield takeEvery(SET_COLLECTION_MANAGERS_REQUEST, handleSetCollectionManagersRequest)
  yield takeEvery(MINT_COLLECTION_ITEMS_REQUEST, handleMintCollectionItemsRequest)
  yield takeEvery(APPROVE_COLLECTION_REQUEST, handleApproveCollectionRequest)
  yield takeEvery(REJECT_COLLECTION_REQUEST, handleRejectCollectionRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(FETCH_TRANSACTION_SUCCESS, handleTransactionSuccess)
}

function* handleFetchCollectionsRequest(action: FetchCollectionsRequestAction) {
  const { address } = action.payload
  try {
    const collections: Collection[] = yield call(() => builder.fetchCollections(address))
    yield put(fetchCollectionsSuccess(collections))
    yield put(closeModal('CreateCollectionModal'))
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
      throw new Error(t('sagas.collection.invalid_character'))
    }
    const items: Item[] = yield select(state => getCollectionItems(state, collection.id))
    const maticChainId = getChainIdByNetwork(Network.MATIC)
    const rarities = getContract(ContractName.Rarities, maticChainId)
    const from: string = yield select(getAddress)
    const { abi } = getContract(ContractName.ERC721CollectionV2, maticChainId)
    const provider: Provider = yield call(getNetworkProvider, maticChainId)
    const collectionV2 = new Contract(rarities.address, abi, new providers.Web3Provider(provider))
    const data = yield getMethodData(
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
    const remoteCollection: Collection = yield call(() => builder.saveCollection(collection, data))
    const newCollection = { ...collection, ...remoteCollection }

    yield put(saveCollectionSuccess(newCollection))
    yield put(closeModal('CreateCollectionModal'))
    yield put(closeModal('EditCollectionNameModal'))
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
    // To ensure the contract address of the collection is correct, we pre-emptively save it to the server and store the response.
    // This will re-generate the address and any other data generated on the server (like the salt) before actually publishing it.
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
      throw saveCollection.failure.payload.error
    }

    if (!collection.salt) {
      throw new Error(t('sagas.item.missing_salt'))
    }

    const from: string = yield select(getAddress)
    const maticChainId = getChainIdByNetwork(Network.MATIC)

    const forwarder = getContract(ContractName.Forwarder, maticChainId)
    const factory = getContract(ContractName.CollectionFactory, maticChainId)
    const manager = getContract(ContractName.CollectionManager, maticChainId)

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
    const maticChainId = getChainIdByNetwork(Network.MATIC)

    const txHash: string = yield changeCollectionStatus(collection, true)
    yield put(approveCollectionSuccess(collection, maticChainId, txHash))
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
  yield deployItems(collection, items)

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

/**
 * Deploys the item entities for each collection item to the Catalyst.
 *
 * @param collection - The collection that owns the items to be deployed.
 * @param items - The items to be deployed as antities to the Catalyst.
 */
function* deployItems(collection: Collection, items: Item[]) {
  const address: string | undefined = yield select(getAddress)
  if (!isOwner(collection, address)) {
    return
  }

  for (const item of items) {
    if (!item.inCatalyst) {
      yield put(deployItemContentsRequest(collection, item))
    }
  }
}

function* changeCollectionStatus(collection: Collection, isApproved: boolean) {
  const maticChainId = getChainIdByNetwork(Network.MATIC)
  const contract = getContract(ContractName.Committee, maticChainId)

  const { abi } = getContract(ContractName.ERC721CollectionV2, maticChainId)
  const implementation = new Contract(collection.contractAddress!, abi)

  const manager = getContract(ContractName.CollectionManager, maticChainId)
  const forwarder = getContract(ContractName.Forwarder, maticChainId)
  const data: string = yield getMethodData(implementation.populateTransaction.setApproved(isApproved))

  const txHash: string = yield call(sendTransaction, contract, committee =>
    committee.manageCollection(manager.address, forwarder.address, collection.contractAddress!, data)
  )
  return txHash
}
