import { action } from 'typesafe-actions'

// Deploy to LAND pool

export const DEPLOY_TO_POOL_REQUEST = '[Request] Deploy to LAND pool'
export const DEPLOY_TO_POOL_SUCCESS = '[Success] Deploy to LAND pool'
export const DEPLOY_TO_POOL_FAILURE = '[Failure] Deploy to LAND pool'

export const deployToPoolRequest = (projectId: string) => action(DEPLOY_TO_POOL_REQUEST, { projectId })
export const deployToPoolSuccess = () => action(DEPLOY_TO_POOL_SUCCESS, {})
export const deployToPoolFailure = (error: string) => action(DEPLOY_TO_POOL_FAILURE, { error })

export type DeployToPoolRequestAction = ReturnType<typeof deployToPoolRequest>
export type DeployToPoolSuccessAction = ReturnType<typeof deployToPoolSuccess>
export type DeployToPoolFailureAction = ReturnType<typeof deployToPoolFailure>
