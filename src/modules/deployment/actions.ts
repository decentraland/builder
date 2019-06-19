import { action } from 'typesafe-actions'
import { Coordinate, Rotation } from 'modules/project/types'
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

export const deployToLandRequest = (ethAddress: string, position: Coordinate, rotation: Rotation) =>
  action(DEPLOY_TO_LAND_REQUEST, { ethAddress, position, rotation })
export const deployToLandSuccess = (thumbnail: string) => action(DEPLOY_TO_LAND_SUCCESS, { thumbnail })
export const deployToLandFailure = (error: string) => action(DEPLOY_TO_LAND_FAILURE, { error })

export type DeployToLandRequestAction = ReturnType<typeof deployToLandRequest>
export type DeployToLandSuccessAction = ReturnType<typeof deployToLandSuccess>
export type DeployToLandFailureAction = ReturnType<typeof deployToLandFailure>

// Set progress

export const SET_PROGRESS = 'Set progress'
export const setProgress = (stage: ProgressStage, progress: number) => action(SET_PROGRESS, { stage, progress })
export type SetProgressAction = ReturnType<typeof setProgress>

// Generate media

export const GENERATE_MEDIA = 'Generate media'
export const generateMedia = () => action(GENERATE_MEDIA, {})
export type GenerateMediaAction = ReturnType<typeof generateMedia>
