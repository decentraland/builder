import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, all } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import {
  FETCH_ITEMS_REQUEST,
  FetchItemsRequestAction,
  fetchItemsSuccess,
  fetchItemsFailure,
  SaveItemRequestAction,
  saveItemSuccess,
  saveItemFailure,
  SAVE_ITEM_REQUEST,
  DeleteItemRequestAction,
  deleteItemSuccess,
  deleteItemFailure,
  DELETE_ITEM_REQUEST,
  fetchItemsRequest,
  SET_COLLECTION,
  SetCollectionAction,
  SET_ITEMS_TOKEN_ID_REQUEST,
  setItemsTokenIdSuccess,
  setItemsTokenIdFailure,
  SetItemsTokenIdRequestAction,
  saveItemRequest,
  SAVE_ITEM_SUCCESS
} from './actions'
import { locations } from 'routing/locations'
import { builder } from 'lib/api/builder'
import { getItemId } from 'modules/location/selectors'

export function* itemSaga() {
  yield takeEvery(FETCH_ITEMS_REQUEST, handleFetchItemsRequest)
  yield takeEvery(SAVE_ITEM_REQUEST, handleSaveItemRequest)
  yield takeEvery(DELETE_ITEM_REQUEST, handleDeleteItemRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeLatest(SET_COLLECTION, handleSetCollection)
  yield takeLatest(SET_ITEMS_TOKEN_ID_REQUEST, handleSetItemsTokenIdRequest)
}

function* handleFetchItemsRequest(_action: FetchItemsRequestAction) {
  try {
    const items = yield call(() => builder.fetchItems())
    yield put(fetchItemsSuccess(items))
  } catch (error) {
    yield put(fetchItemsFailure(error.message))
  }
}

function* handleSaveItemRequest(action: SaveItemRequestAction) {
  const { item, contents } = action.payload
  try {
    yield call(() => builder.saveItem(item, contents))
    yield put(saveItemSuccess(item, contents))
    yield put(closeModal('CreateItemModal'))
    yield put(closeModal('EditPriceAndBeneficiaryModal'))
  } catch (error) {
    yield put(saveItemFailure(item, contents, error.message))
  }
}

function* handleDeleteItemRequest(action: DeleteItemRequestAction) {
  const { item } = action.payload
  try {
    yield call(() => builder.deleteItem(item))
    yield put(deleteItemSuccess(item))
    const itemIdInUriParam = yield select(getItemId)
    if (itemIdInUriParam === item.id) {
      yield put(replace(locations.avatar()))
    }
  } catch (error) {
    yield put(deleteItemFailure(item, error.message))
  }
}

function* handleConnectWalletSuccess() {
  yield put(fetchItemsRequest())
}

function* handleSetCollection(action: SetCollectionAction) {
  const { item, collectionId } = action.payload
  const newItem = { ...item }
  if (collectionId === null) {
    delete newItem.collectionId
  } else {
    newItem.collectionId = collectionId
  }
  yield put(saveItemRequest(newItem, {}))
  yield take(SAVE_ITEM_SUCCESS)
  yield put(closeModal('AddExistingItemModal'))
}

function* handleSetItemsTokenIdRequest(action: SetItemsTokenIdRequestAction) {
  const { items, tokenIds } = action.payload

  try {
    const saves = []
    const newItems = []
    for (const [index, item] of items.entries()) {
      const tokenId = tokenIds[index]
      const newItem = {
        ...item,
        tokenId
      }
      saves.push(call(() => builder.saveItem(newItem, {})))
      newItems.push(newItem)
    }

    yield all(saves)
    yield put(setItemsTokenIdSuccess(newItems, tokenIds))
  } catch (error) {
    yield put(setItemsTokenIdFailure(items, error.message))
  }
}
