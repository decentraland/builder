import { action } from 'typesafe-actions'
import { Deployment } from 'modules/deployment/types'
import { ProgressStage } from './types'

// Clear LAND deployment

export const CLEAR_DEPLOYMENT_REQUEST = '[Request] Clear Deployment'
export const CLEAR_DEPLOYMENT_SUCCESS = '[Success] Clear Deployment'
export const CLEAR_DEPLOYMENT_FAILURE = '[Failure] Clear Deployment'

export const clearDeploymentRequest = (deploymentId: string) => action(CLEAR_DEPLOYMENT_REQUEST, { deploymentId })
export const clearDeploymentSuccess = (deploymentId: string) => action(CLEAR_DEPLOYMENT_SUCCESS, { deploymentId })
export const clearDeploymentFailure = (deploymentId: string, error: string) => action(CLEAR_DEPLOYMENT_FAILURE, { deploymentId, error })

export type ClearDeploymentRequestAction = ReturnType<typeof clearDeploymentRequest>
export type ClearDeploymentSuccessAction = ReturnType<typeof clearDeploymentSuccess>
export type ClearDeploymentFailureAction = ReturnType<typeof clearDeploymentFailure>

// Set progress

export const SET_PROGRESS = 'Set Deployment progress'
export const setProgress = (stage: ProgressStage, value: number) => action(SET_PROGRESS, { stage, value })
export type SetProgressAction = ReturnType<typeof setProgress>

// Fetch deployments
export const FETCH_DEPLOYMENTS_REQUEST = '[Request] Fetch deployments'
export const FETCH_DEPLOYMENTS_SUCCESS = '[Success] Fetch deployments'
export const FETCH_DEPLOYMENTS_FAILURE = '[Failure] Fetch deployments'

export const fetchDeploymentsRequest = (coords: string[]) => action(FETCH_DEPLOYMENTS_REQUEST, { coords })
export const fetchDeploymentsSuccess = (coords: string[], deployments: Deployment[]) =>
  action(FETCH_DEPLOYMENTS_SUCCESS, { coords, deployments })
export const fetchDeploymentsFailure = (coords: string[], error: string) => action(FETCH_DEPLOYMENTS_FAILURE, { coords, error })

export type FetchDeploymentsRequestAction = ReturnType<typeof fetchDeploymentsRequest>
export type FetchDeploymentsSuccessAction = ReturnType<typeof fetchDeploymentsSuccess>
export type FetchDeploymentsFailureAction = ReturnType<typeof fetchDeploymentsFailure>

// Fetch World deployments
export const FETCH_WORLD_DEPLOYMENTS_REQUEST = '[Request] Fetch World deployments'
export const FETCH_WORLD_DEPLOYMENTS_SUCCESS = '[Success] Fetch World deployments'
export const FETCH_WORLD_DEPLOYMENTS_FAILURE = '[Failure] Fetch World deployments'

export const fetchWorldDeploymentsRequest = (worlds: string[]) => action(FETCH_WORLD_DEPLOYMENTS_REQUEST, { worlds })
export const fetchWorldDeploymentsSuccess = (worlds: string[], deployments: Deployment[]) =>
  action(FETCH_WORLD_DEPLOYMENTS_SUCCESS, { worlds, deployments })
export const fetchWorldDeploymentsFailure = (worlds: string[], error: string) => action(FETCH_WORLD_DEPLOYMENTS_FAILURE, { worlds, error })

export type FetchWorldDeploymentsRequestAction = ReturnType<typeof fetchWorldDeploymentsRequest>
export type FetchWorldDeploymentsSuccessAction = ReturnType<typeof fetchWorldDeploymentsSuccess>
export type FetchWorldDeploymentsFailureAction = ReturnType<typeof fetchWorldDeploymentsFailure>
