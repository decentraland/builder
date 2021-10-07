import { all, takeEvery, put } from 'redux-saga/effects'
import { PayloadAction } from 'typesafe-actions'
import { toastSaga as baseToastSaga } from 'decentraland-dapps/dist/modules/toast/sagas'
import { showToast } from 'decentraland-dapps/dist/modules/toast/actions'
import {
  APPROVE_COLLECTION_FAILURE,
  MINT_COLLECTION_ITEMS_FAILURE,
  PUBLISH_COLLECTION_FAILURE,
  REJECT_COLLECTION_FAILURE,
  SET_COLLECTION_MANAGERS_FAILURE,
  SET_COLLECTION_MINTERS_FAILURE
} from 'modules/collection/actions'
import { getMetaTransactionFailureToast } from './toasts'

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
}

function* handleMetaTransactionFailure(action: PayloadAction<any, { error: string }>) {
  const { error } = action.payload

  if (!isUserDeniedSignature(error)) {
    yield put(showToast(getMetaTransactionFailureToast()))
  }
}

function isUserDeniedSignature(message: string = '') {
  return message.indexOf('User denied') !== -1
}
