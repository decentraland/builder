import { put, takeEvery } from 'redux-saga/effects'
import { closeAllModals } from 'decentraland-dapps/dist/modules/modal/actions'
import { RESET_ITEM_SUCCESS, SET_PRICE_AND_BENEFICIARY_SUCCESS } from 'modules/item/actions'
import { PUSH_COLLECTION_CURATION_SUCCESS } from 'modules/curations/collectionCuration/actions'
import { EXPORT_PROJECT_SUCCESS } from 'modules/project/actions'
import { ROUTER_LOCATION_CHANGE } from 'modules/location/actions'

export function* modalSaga() {
  yield takeEvery(
    [PUSH_COLLECTION_CURATION_SUCCESS, RESET_ITEM_SUCCESS, SET_PRICE_AND_BENEFICIARY_SUCCESS, EXPORT_PROJECT_SUCCESS],
    handleCloseAllModals
  )
  yield takeEvery(ROUTER_LOCATION_CHANGE, handleCloseAllModals)
}

function* handleCloseAllModals() {
  yield put(closeAllModals())
}
