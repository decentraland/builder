import { DeploymentOptions, DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { action } from 'typesafe-actions'

// Fetch Item Entity
export const FETCH_ENTITIES_REQUEST = '[Request] Fetch Entities'
export const FETCH_ENTITIES_SUCCESS = '[Success] Fetch Entities'
export const FETCH_ENTITIES_FAILURE = '[Failure] Fetch Entities'

export const fetchEntitiesRequest = (options: DeploymentOptions<DeploymentWithMetadataContentAndPointers>) =>
  action(FETCH_ENTITIES_REQUEST, { options })
export const fetchEntitiesSuccess = (
  entities: DeploymentWithMetadataContentAndPointers[],
  options: DeploymentOptions<DeploymentWithMetadataContentAndPointers>
) => action(FETCH_ENTITIES_SUCCESS, { entities, options })
export const fetchEntitiesFailure = (error: string, options: DeploymentOptions<DeploymentWithMetadataContentAndPointers>) =>
  action(FETCH_ENTITIES_FAILURE, { error, options })

export type FetchEntitiesRequestAction = ReturnType<typeof fetchEntitiesRequest>
export type FetchEntitiesSuccessAction = ReturnType<typeof fetchEntitiesSuccess>
export type FetchEntitiesFailureAction = ReturnType<typeof fetchEntitiesFailure>
