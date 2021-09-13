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
import { DeployItemContentsFailureAction, DEPLOY_ITEM_CONTENTS_FAILURE, SAVE_PUBLISHED_ITEM_FAILURE } from 'modules/item/actions'
import { isItemSizeError } from 'modules/item/utils'
import { getDeployItemFailureToast, getMetaTransactionFailureToast } from './toasts'

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
  yield takeEvery(DEPLOY_ITEM_CONTENTS_FAILURE, handleDeployItemFailure)
}

function* handleMetaTransactionFailure(action: PayloadAction<any, { error: string }>) {
  const { error } = action.payload

  if (!isUserDeniedSignature(error)) {
    yield put(showToast(getMetaTransactionFailureToast()))
  }
}

function* handleDeployItemFailure(action: DeployItemContentsFailureAction) {
  const { item, collection, error } = action.payload
  if (isItemSizeError(error)) {
    yield put(showToast(getDeployItemFailureToast(item, collection)))
  }
}

function isUserDeniedSignature(message: string = '') {
  return message.indexOf('User denied') !== -1
}
