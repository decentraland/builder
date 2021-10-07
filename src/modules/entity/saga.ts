import { CatalystClient, DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { call, put, takeEvery } from 'redux-saga/effects'
import { fetchEntitiesFailure, FetchEntitiesRequestAction, fetchEntitiesSuccess, FETCH_ENTITIES_REQUEST } from './actions'

export function* entitySaga(client: CatalystClient) {
  // takes
  yield takeEvery(FETCH_ENTITIES_REQUEST, handleFetchEntitiesRequest)

  // handlers
  function* handleFetchEntitiesRequest(action: FetchEntitiesRequestAction) {
    const { options } = action.payload
    try {
      const entities: DeploymentWithMetadataContentAndPointers[] = yield call([client, 'fetchAllDeployments'], options)
      yield put(fetchEntitiesSuccess(entities, options))
    } catch (error) {
      yield put(fetchEntitiesFailure(error.message, options))
    }
  }
}
