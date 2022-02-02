import { all, call, put, takeEvery } from 'redux-saga/effects'
import { CatalystClient } from 'dcl-catalyst-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import { Authenticator, AuthIdentity } from 'dcl-crypto'
import { getIdentity } from 'modules/identity/utils'
import {
  deployEntitiesFailure,
  DeployEntitiesRequestAction,
  deployEntitiesSuccess,
  DeployEntitiesSuccessAction,
  DEPLOY_ENTITIES_REQUEST,
  DEPLOY_ENTITIES_SUCCESS,
  fetchEntitiesByIdsFailure,
  fetchEntitiesByIdsRequest,
  FetchEntitiesByIdsRequestAction,
  fetchEntitiesByIdsSuccess,
  fetchEntitiesByPointersFailure,
  FetchEntitiesByPointersRequestAction,
  fetchEntitiesByPointersSuccess,
  FETCH_ENTITIES_BY_IDS_REQUEST,
  FETCH_ENTITIES_BY_POINTERS_REQUEST
} from './actions'

export function* entitySaga(catalyst: CatalystClient) {
  // takes
  yield takeEvery(FETCH_ENTITIES_BY_POINTERS_REQUEST, handleFetchEntitiesByPointersRequest)
  yield takeEvery(FETCH_ENTITIES_BY_IDS_REQUEST, handleFetchEntitiesByIdsRequest)
  yield takeEvery(DEPLOY_ENTITIES_REQUEST, handleDeployEntitiesRequest)
  yield takeEvery(DEPLOY_ENTITIES_SUCCESS, handleDeployEntitiesSuccess)

  // handlers
  function* handleFetchEntitiesByPointersRequest(action: FetchEntitiesByPointersRequestAction) {
    const { type, pointers } = action.payload
    try {
      const entities: Entity[] = yield call([catalyst, 'fetchEntitiesByPointers'], type, pointers)
      yield put(fetchEntitiesByPointersSuccess(type, pointers, entities))
    } catch (error) {
      yield put(fetchEntitiesByPointersFailure(type, pointers, error.message))
    }
  }

  function* handleFetchEntitiesByIdsRequest(action: FetchEntitiesByIdsRequestAction) {
    const { type, ids } = action.payload
    try {
      const entities: Entity[] = yield call([catalyst, 'fetchEntitiesByIds'], type, ids)
      yield put(fetchEntitiesByIdsSuccess(type, ids, entities))
    } catch (error) {
      yield put(fetchEntitiesByIdsFailure(type, ids, error.message))
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
    const ids = action.payload.entities.map(entity => entity.entityId)
    if (ids.length > 0) {
      yield put(fetchEntitiesByIdsRequest(EntityType.WEARABLE, ids))
    }
  }
}
