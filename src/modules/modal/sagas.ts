import { LOCATION_CHANGE } from 'connected-react-router'
import { delay, put, select, takeEvery } from 'redux-saga/effects'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { SAVE_ITEM_SUCCESS } from 'modules/item/actions'
import { closeAllModals } from './actions'

export function* modalSaga() {
  yield takeEvery(LOCATION_CHANGE, handleLocationChange)
  yield takeEvery(SAVE_ITEM_SUCCESS, handleSaveItemSuccess)
}

function* handleLocationChange() {
  const openModals: ModalState = yield select(getOpenModals)
  if (Object.keys(openModals).length > 0) {
    yield delay(100)
    yield put(closeAllModals())
  }
}

function* handleSaveItemSuccess() {
  yield put(closeAllModals())
}
