import { all, call, put, takeEvery } from 'redux-saga/effects'
import { CatalystClient, DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { Authenticator, AuthIdentity } from 'dcl-crypto'
import { getIdentity } from 'modules/identity/utils'
import {
  deployEntitiesFailure,
  DeployEntitiesRequestAction,
  deployEntitiesSuccess,
  DeployEntitiesSuccessAction,
  DEPLOY_ENTITIES_REQUEST,
  DEPLOY_ENTITIES_SUCCESS,
  fetchEntitiesFailure,
  fetchEntitiesRequest,
  FetchEntitiesRequestAction,
  fetchEntitiesSuccess,
  FETCH_ENTITIES_REQUEST
} from './actions'

export function* entitySaga(catalyst: CatalystClient) {
  // takes
  yield takeEvery(FETCH_ENTITIES_REQUEST, handleFetchEntitiesRequest)
  yield takeEvery(DEPLOY_ENTITIES_REQUEST, handleDeployEntitiesRequest)
  yield takeEvery(DEPLOY_ENTITIES_SUCCESS, handleDeployEntitiesSuccess)

  // handlers
  function* handleFetchEntitiesRequest(action: FetchEntitiesRequestAction) {
    const { options } = action.payload
    try {
      const entities: DeploymentWithMetadataContentAndPointers[] = yield call([catalyst, 'fetchAllDeployments'], options)
      yield put(fetchEntitiesSuccess(entities, options))
    } catch (error) {
      yield put(fetchEntitiesFailure(error.message, options))
    }
  }

  function* handleDeployEntitiesRequest(action: DeployEntitiesRequestAction) {
    const { entities } = action.payload
    try {
      const identity: AuthIdentity | undefined = yield getIdentity()

      if (!identity) {
        throw new Error('Invalid Identity')
      }

      yield all(
        entities.map(entity =>
          call([catalyst, 'deployEntity'], { ...entity, authChain: Authenticator.signPayload(identity, entity.entityId) })
        )
      )

      yield put(deployEntitiesSuccess(entities))
    } catch (error) {
      yield put(deployEntitiesFailure(entities, error.message))
    }
  }

  function* handleDeployEntitiesSuccess(action: DeployEntitiesSuccessAction) {
    const entityIds = action.payload.entities.map(entity => entity.entityId)
    if (entityIds.length > 0) {
      yield put(fetchEntitiesRequest({ filters: { entityIds } }))
    }
  }
}
