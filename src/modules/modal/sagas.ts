import { LOCATION_CHANGE, LocationChangeAction } from 'modules/location/actions'
import { delay, put, select, takeEvery } from 'redux-saga/effects'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { closeAllModals, closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { RESET_ITEM_SUCCESS, SET_PRICE_AND_BENEFICIARY_SUCCESS } from 'modules/item/actions'
import { PUSH_COLLECTION_CURATION_SUCCESS } from 'modules/curations/collectionCuration/actions'
import { EXPORT_PROJECT_SUCCESS } from 'modules/project/actions'
import { SET_COLLECTION_MINTERS_SUCCESS } from 'modules/collection/actions'
import { locations } from 'routing/locations'

export function* modalSaga() {
  yield takeEvery(LOCATION_CHANGE, handleLocationChange)
  yield takeEvery(
    [
      PUSH_COLLECTION_CURATION_SUCCESS,
      RESET_ITEM_SUCCESS,
      SET_PRICE_AND_BENEFICIARY_SUCCESS,
      EXPORT_PROJECT_SUCCESS,
      SET_COLLECTION_MINTERS_SUCCESS
    ],
    handleCloseAllModals
  )
}

function* handleLocationChange(action: LocationChangeAction) {
  const modalsToClose = Object.keys(yield select(getOpenModals))
  if (modalsToClose.length === 0) return

  yield delay(100)
  const openModalsAfter: ModalState = yield select(getOpenModals)
  const isNavigatingToScenes = action.payload.location.pathname.startsWith(locations.scenes().split('?')[0])

  for (const modalName of modalsToClose) {
    if (openModalsAfter[modalName] && !(isNavigatingToScenes && modalName === 'CreatorHubUpgradeModal')) {
      yield put(closeModal(modalName))
    }
  }
}

function* handleCloseAllModals() {
  yield put(closeAllModals())
}
