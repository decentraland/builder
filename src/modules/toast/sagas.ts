import { all, takeEvery, put } from 'redux-saga/effects'
import { toastSaga as baseToastSaga } from 'decentraland-dapps/dist/modules/toast/sagas'
import {
  APPROVE_COLLECTION_FAILURE,
  MINT_COLLECTION_ITEMS_FAILURE,
  PUBLISH_COLLECTION_FAILURE,
  REJECT_COLLECTION_FAILURE,
  SET_COLLECTION_MANAGERS_FAILURE,
  SET_COLLECTION_MINTERS_FAILURE
} from 'modules/collection/actions'
import { showToast } from 'decentraland-dapps/dist/modules/toast/actions'
import { getMetaTransactionFailureToast } from './toasts'
import { SAVE_PUBLISHED_ITEM_FAILURE } from 'modules/item/actions'

export function* toastSaga() {
  yield all([baseToastSaga(), customToastSaga()])
}

function* customToastSaga() {
  yield takeEvery(PUBLISH_COLLECTION_FAILURE, handleMetaTransactionFailure)
  yield takeEvery(SET_COLLECTION_MINTERS_FAILURE, handleMetaTransactionFailure)
  yield takeEvery(SET_COLLECTION_MANAGERS_FAILURE, handleMetaTransactionFailure)
  yield takeEvery(MINT_COLLECTION_ITEMS_FAILURE, handleMetaTransactionFailure)
  yield takeEvery(APPROVE_COLLECTION_FAILURE, handleMetaTransactionFailure)
  yield takeEvery(REJECT_COLLECTION_FAILURE, handleMetaTransactionFailure)
  yield takeEvery(SAVE_PUBLISHED_ITEM_FAILURE, handleMetaTransactionFailure)
}

function* handleMetaTransactionFailure() {
  yield put(showToast(getMetaTransactionFailureToast()))
}
