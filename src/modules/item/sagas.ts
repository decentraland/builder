import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest } from 'redux-saga/effects'
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
  fetchItemsRequest
} from './actions'
import { locations } from 'routing/locations'
import { builder } from 'lib/api/builder'

export function* itemSaga() {
  yield takeEvery(FETCH_ITEMS_REQUEST, handleFetchItemsRequest)
  yield takeEvery(SAVE_ITEM_REQUEST, handleSaveItemRequest)
  yield takeEvery(DELETE_ITEM_REQUEST, handleDeleteItemRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
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
    yield put(replace(locations.avatar()))
  } catch (error) {
    yield put(deleteItemFailure(item, error.message))
  }
}

function* handleConnectWalletSuccess() {
  yield put(fetchItemsRequest())
}
