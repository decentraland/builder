import { action } from 'typesafe-actions'
import { Placement } from 'modules/deployment/types'
import { ProgressStage } from './types'

// Deploy to LAND pool

export const DEPLOY_TO_POOL_REQUEST = '[Request] Deploy to LAND pool'
export const DEPLOY_TO_POOL_SUCCESS = '[Success] Deploy to LAND pool'
export const DEPLOY_TO_POOL_FAILURE = '[Failure] Deploy to LAND pool'

export const deployToPoolRequest = (projectId: string) => action(DEPLOY_TO_POOL_REQUEST, { projectId })
export const deployToPoolSuccess = (images: string) => action(DEPLOY_TO_POOL_SUCCESS, { images })
export const deployToPoolFailure = (error: string) => action(DEPLOY_TO_POOL_FAILURE, { error })

export type DeployToPoolRequestAction = ReturnType<typeof deployToPoolRequest>
export type DeployToPoolSuccessAction = ReturnType<typeof deployToPoolSuccess>
export type DeployToPoolFailureAction = ReturnType<typeof deployToPoolFailure>

// Deploy to LAND

export const DEPLOY_TO_LAND_REQUEST = '[Request] Deploy to LAND'
export const DEPLOY_TO_LAND_SUCCESS = '[Success] Deploy to LAND'
export const DEPLOY_TO_LAND_FAILURE = '[Failure] Deploy to LAND'

export const deployToLandRequest = (projectId: string, placement: Placement) => action(DEPLOY_TO_LAND_REQUEST, { projectId, placement })
export const deployToLandSuccess = (projectId: string, cid: string, placement: Placement) =>
  action(DEPLOY_TO_LAND_SUCCESS, { projectId, cid, placement })
export const deployToLandFailure = (error: string) => action(DEPLOY_TO_LAND_FAILURE, { error })

export type DeployToLandRequestAction = ReturnType<typeof deployToLandRequest>
export type DeployToLandSuccessAction = ReturnType<typeof deployToLandSuccess>
export type DeployToLandFailureAction = ReturnType<typeof deployToLandFailure>

// Clear LAND deployment

export const CLEAR_DEPLOYMENT_REQUEST = '[Request] Clear Deployment'
export const CLEAR_DEPLOYMENT_SUCCESS = '[Success] Clear Deployment'
export const CLEAR_DEPLOYMENT_FAILURE = '[Failure] Clear Deployment'

export const clearDeploymentRequest = (projectId: string) => action(CLEAR_DEPLOYMENT_REQUEST, { projectId })
export const clearDeploymentSuccess = (projectId: string) => action(CLEAR_DEPLOYMENT_SUCCESS, { projectId })
export const clearDeploymentFailure = (error: string) => action(CLEAR_DEPLOYMENT_FAILURE, { error })

export type ClearDeploymentRequestAction = ReturnType<typeof clearDeploymentRequest>
export type ClearDeploymentSuccessAction = ReturnType<typeof clearDeploymentSuccess>
export type ClearDeploymentFailureAction = ReturnType<typeof clearDeploymentFailure>

// Set progress

export const SET_PROGRESS = 'Set progress'
export const setProgress = (stage: ProgressStage, progress: number) => action(SET_PROGRESS, { stage, progress })
export type SetProgressAction = ReturnType<typeof setProgress>

// Mark Dirty

export const MARK_DIRTY = 'Mark dirty'
export const markDirty = (projectId: string, isDirty: boolean = true) => action(MARK_DIRTY, { projectId, isDirty })
export type MarkDirtyAction = ReturnType<typeof markDirty>
