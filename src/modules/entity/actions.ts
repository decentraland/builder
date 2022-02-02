import { action } from 'typesafe-actions'
import { DeploymentPreparationData } from 'dcl-catalyst-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'

// Fetch Entities By Pointers
export const FETCH_ENTITIES_BY_POINTERS_REQUEST = '[Request] Fetch Entities By Pointers'
export const FETCH_ENTITIES_BY_POINTERS_SUCCESS = '[Success] Fetch Entities By Pointers'
export const FETCH_ENTITIES_BY_POINTERS_FAILURE = '[Failure] Fetch Entities By Pointers'

export const fetchEntitiesByPointersRequest = (type: EntityType, pointers: string[]) =>
  action(FETCH_ENTITIES_BY_POINTERS_REQUEST, { type, pointers })
export const fetchEntitiesByPointersSuccess = (type: EntityType, pointers: string[], entities: Entity[]) =>
  action(FETCH_ENTITIES_BY_POINTERS_SUCCESS, { entities, type, pointers })
export const fetchEntitiesByPointersFailure = (type: EntityType, pointers: string[], error: string) =>
  action(FETCH_ENTITIES_BY_POINTERS_FAILURE, { error, type, pointers })

export type FetchEntitiesByPointersRequestAction = ReturnType<typeof fetchEntitiesByPointersRequest>
export type FetchEntitiesByPointersSuccessAction = ReturnType<typeof fetchEntitiesByPointersSuccess>
export type FetchEntitiesByPointersFailureAction = ReturnType<typeof fetchEntitiesByPointersFailure>

// Fetch Entities By Hash
export const FETCH_ENTITIES_BY_IDS_REQUEST = '[Request] Fetch Entities By Ids'
export const FETCH_ENTITIES_BY_IDS_SUCCESS = '[Success] Fetch Entities By Ids'
export const FETCH_ENTITIES_BY_IDS_FAILURE = '[Failure] Fetch Entities By Ids'

export const fetchEntitiesByIdsRequest = (type: EntityType, ids: string[]) => action(FETCH_ENTITIES_BY_IDS_REQUEST, { type, ids })
export const fetchEntitiesByIdsSuccess = (type: EntityType, ids: string[], entities: Entity[]) =>
  action(FETCH_ENTITIES_BY_IDS_SUCCESS, { type, ids, entities })
export const fetchEntitiesByIdsFailure = (type: EntityType, ids: string[], error: string) =>
  action(FETCH_ENTITIES_BY_IDS_FAILURE, { type, ids, error })

export type FetchEntitiesByIdsRequestAction = ReturnType<typeof fetchEntitiesByIdsRequest>
export type FetchEntitiesByIdsSuccessAction = ReturnType<typeof fetchEntitiesByIdsSuccess>
export type FetchEntitiesByIdsFailureAction = ReturnType<typeof fetchEntitiesByIdsFailure>

// Deploy entities

export const DEPLOY_ENTITIES_REQUEST = '[Request] Deploy entities'
export const DEPLOY_ENTITIES_SUCCESS = '[Success] Deploy entities'
export const DEPLOY_ENTITIES_FAILURE = '[Failure] Deploy entities'

export const deployEntitiesRequest = (entities: DeploymentPreparationData[]) => action(DEPLOY_ENTITIES_REQUEST, { entities })
export const deployEntitiesSuccess = (entities: DeploymentPreparationData[]) => action(DEPLOY_ENTITIES_SUCCESS, { entities })
export const deployEntitiesFailure = (entities: DeploymentPreparationData[], error: string) =>
  action(DEPLOY_ENTITIES_FAILURE, { entities, error })

export type DeployEntitiesRequestAction = ReturnType<typeof deployEntitiesRequest>
export type DeployEntitiesSuccessAction = ReturnType<typeof deployEntitiesSuccess>
export type DeployEntitiesFailureAction = ReturnType<typeof deployEntitiesFailure>
