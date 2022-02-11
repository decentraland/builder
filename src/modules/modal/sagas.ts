import { LOCATION_CHANGE } from 'connected-react-router'
import { delay, put, select, takeEvery } from 'redux-saga/effects'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { RESET_ITEM_SUCCESS, SAVE_ITEM_SUCCESS, SET_PRICE_AND_BENEFICIARY_SUCCESS } from 'modules/item/actions'
import { closeAllModals } from './actions'
import { PUSH_COLLECTION_CURATION_SUCCESS } from 'modules/collectionCuration/actions'
import { EXPORT_PROJECT_SUCCESS } from 'modules/project/actions'

export function* modalSaga() {
  yield takeEvery(LOCATION_CHANGE, handleLocationChange)
  yield takeEvery(
    [SAVE_ITEM_SUCCESS, PUSH_COLLECTION_CURATION_SUCCESS, RESET_ITEM_SUCCESS, SET_PRICE_AND_BENEFICIARY_SUCCESS, EXPORT_PROJECT_SUCCESS],
    handleCloseAllModals
  )
}

function* handleLocationChange() {
  const openModals: ModalState = yield select(getOpenModals)
  if (Object.keys(openModals).length > 0) {
    yield delay(100)
    yield handleCloseAllModals()
  }
}

function* handleCloseAllModals() {
  yield put(closeAllModals())
}
