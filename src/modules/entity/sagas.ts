import { all, call, put, takeEvery } from 'redux-saga/effects'
import { CatalystClient, ContentClient } from 'dcl-catalyst-client'
import { Entity, EntityType } from '@dcl/schemas'
import { Authenticator, AuthIdentity } from '@dcl/crypto'
import { getIdentity } from 'modules/identity/utils'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
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

export function* entitySaga(catalystClient: CatalystClient) {
  // takes
  yield takeEvery(FETCH_ENTITIES_BY_POINTERS_REQUEST, handleFetchEntitiesByPointersRequest)
  yield takeEvery(FETCH_ENTITIES_BY_IDS_REQUEST, handleFetchEntitiesByIdsRequest)
  yield takeEvery(DEPLOY_ENTITIES_REQUEST, handleDeployEntitiesRequest)
  yield takeEvery(DEPLOY_ENTITIES_SUCCESS, handleDeployEntitiesSuccess)

  // handlers
  function* handleFetchEntitiesByPointersRequest(action: FetchEntitiesByPointersRequestAction) {
    const { type, pointers } = action.payload
    try {
      const contentClient: ContentClient = yield call([catalystClient, 'getContentClient'])
      const entities: Entity[] = yield call([contentClient, 'fetchEntitiesByPointers'], pointers)
      yield put(fetchEntitiesByPointersSuccess(type, pointers, entities))
    } catch (error) {
      yield put(fetchEntitiesByPointersFailure(type, pointers, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchEntitiesByIdsRequest(action: FetchEntitiesByIdsRequestAction) {
    const { type, ids } = action.payload
    try {
      const contentClient: ContentClient = yield call([catalystClient, 'getContentClient'])
      const entities: Entity[] = yield call([contentClient, 'fetchEntitiesByIds'], ids)
      yield put(fetchEntitiesByIdsSuccess(type, ids, entities))
    } catch (error) {
      yield put(fetchEntitiesByIdsFailure(type, ids, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleDeployEntitiesRequest(action: DeployEntitiesRequestAction) {
    const { entities } = action.payload
    try {
      const identity: AuthIdentity | undefined = yield getIdentity()

      if (!identity) {
        throw new Error('Invalid Identity')
      }
      const contentClient: ContentClient = yield call([catalystClient, 'getContentClient'])
      yield all(
        entities.map(entity =>
          call([contentClient, 'deploy'], { ...entity, authChain: Authenticator.signPayload(identity, entity.entityId) })
        )
      )

      yield put(deployEntitiesSuccess(entities))
    } catch (error) {
      yield put(deployEntitiesFailure(entities, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleDeployEntitiesSuccess(action: DeployEntitiesSuccessAction) {
    const ids = action.payload.entities.map(entity => entity.entityId)
    if (ids.length > 0) {
      yield put(fetchEntitiesByIdsRequest(EntityType.WEARABLE, ids))
    }
  }
}
