import { call, put, takeEvery } from 'redux-saga/effects'
import { FETCH_NAMES_REQUEST, FetchNamesRequestAction, fetchNamesFailure, fetchNamesSuccess } from './actions'
import { Name } from './types'
import { manager } from 'lib/api/manager'

export function* landSaga() {
  yield takeEvery(FETCH_NAMES_REQUEST, handleFetchLandRequest)
}

function* handleFetchLandRequest(action: FetchNamesRequestAction) {
  const { address } = action.payload
  try {
    const names: Name[] = yield call(() => manager.fetchNames(address))
    yield put(fetchNamesSuccess(address, names))
  } catch (error) {
    yield put(fetchNamesFailure(address, error.message))
  }
}
