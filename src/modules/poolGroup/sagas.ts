import { takeLatest, put, call, fork } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import {
  LOAD_POOL_GROUPS_REQUEST,
  LoadPoolGroupsRequestAction,
  loadPoolGroupsFailure,
  loadPoolGroupsSuccess,
  loadPoolGroupsRequest
} from './actions'
import { PoolGroup } from './types'
import { ModelById } from 'decentraland-dapps/dist/lib/types'

export function* poolGroupSaga(builder: BuilderAPI) {
  yield fork(handlePoolGroups)
  yield takeLatest(LOAD_POOL_GROUPS_REQUEST, handleLoadPoolGroups)

  function* handleLoadPoolGroups(_action: LoadPoolGroupsRequestAction) {
    try {
      const poolGroups: PoolGroup[] = yield call(() => builder.fetchPoolGroups())
      const record: ModelById<PoolGroup> = {}

      for (const poolGroup of poolGroups) {
        record[poolGroup.id] = poolGroup
      }

      yield put(loadPoolGroupsSuccess(record))
    } catch (e) {
      yield put(loadPoolGroupsFailure(e.message))
    }
  }
}

function* handlePoolGroups() {
  yield put(loadPoolGroupsRequest())
}
