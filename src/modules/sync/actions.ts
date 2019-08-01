import { action } from 'typesafe-actions'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'

// Sync
export const SYNC = 'Sync'
export const sync = () => action(SYNC)
export type SyncAction = ReturnType<typeof sync>

// Retry sync
export const RETRY_SYNC = 'Retry sync'
export const retrySync = () => action(RETRY_SYNC)
export type RetrySyncAction = ReturnType<typeof retrySync>

// Save project to cloud
export const SAVE_PROJECT_REQUEST = '[Request] Save project'
export const SAVE_PROJECT_SUCCESS = '[Success] Save project'
export const SAVE_PROJECT_FAILURE = '[Failure] Save project'

export const saveProjectRequest = (project: Project) => action(SAVE_PROJECT_REQUEST, { project })
export const saveProjectSuccess = (project: Project) => action(SAVE_PROJECT_SUCCESS, { project })
export const saveProjectFailure = (project: Project, error: string) => action(SAVE_PROJECT_FAILURE, { project, error })

export type SaveProjectRequestAction = ReturnType<typeof saveProjectRequest>
export type SaveProjectSuccessAction = ReturnType<typeof saveProjectSuccess>
export type SaveProjectFailureAction = ReturnType<typeof saveProjectFailure>

// Save deployment
export const SAVE_DEPLOYMENT_REQUEST = '[Request] Save deployment'
export const SAVE_DEPLOYMENT_SUCCESS = '[Success] Save deployment'
export const SAVE_DEPLOYMENT_FAILURE = '[Failure] Save deployment'

export const saveDeploymentRequest = (deployment: Deployment) => action(SAVE_DEPLOYMENT_REQUEST, { deployment })
export const saveDeploymentSuccess = (deployment: Deployment) => action(SAVE_DEPLOYMENT_SUCCESS, { deployment })
export const saveDeploymentFailure = (deployment: Deployment, error: string) => action(SAVE_DEPLOYMENT_FAILURE, { deployment, error })

export type SaveDeploymentRequestAction = ReturnType<typeof saveDeploymentRequest>
export type SaveDeploymentSuccessAction = ReturnType<typeof saveDeploymentSuccess>
export type SaveDeploymentFailureAction = ReturnType<typeof saveDeploymentFailure>
