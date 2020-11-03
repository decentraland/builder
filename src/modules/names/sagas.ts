import { call, put, takeEvery } from 'redux-saga/effects'
import { FETCH_NAMES_REQUEST, FetchNamesRequestAction, fetchNamesFailure, fetchNamesSuccess } from './actions'
import { manager } from 'lib/api/manager'
import { getPagination } from 'modules/pool/utils'

export function* namesSaga() {
  yield takeEvery(FETCH_NAMES_REQUEST, handleFetchNamesRequest)
}

function* handleFetchNamesRequest(action: FetchNamesRequestAction) {
  const { address, page } = action.payload
  try {
    const { offset, limit } = getPagination(page || 1, 10)
    const { names, total } = yield call(() => manager.fetchNames(address, offset, limit))
    yield put(fetchNamesSuccess(address, names, total))
  } catch (error) {
    yield put(fetchNamesFailure(address, error.message))
  }
}
