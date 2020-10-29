import { call, put, takeEvery } from 'redux-saga/effects'
import { FETCH_NAMES_REQUEST, FetchNamesRequestAction, fetchNamesFailure, fetchNamesSuccess } from './actions'
import { Name } from './types'
import { manager } from 'lib/api/manager'

export function* namesSaga() {
  yield takeEvery(FETCH_NAMES_REQUEST, handleFetchNamesRequest)
}

function* handleFetchNamesRequest(action: FetchNamesRequestAction) {
  const { address } = action.payload
  console.log({ address })
  try {
    const names: Name[] = yield call(() => manager.fetchNames(address))
    yield put(fetchNamesSuccess(address, names))
  } catch (error) {
    yield put(fetchNamesFailure(address, error.message))
  }
}
