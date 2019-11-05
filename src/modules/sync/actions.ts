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

export const saveProjectRequest = (project: Project, debounce: boolean = true) => action(SAVE_PROJECT_REQUEST, { project, debounce })
export const saveProjectSuccess = (project: Project) => action(SAVE_PROJECT_SUCCESS, { project })
export const saveProjectFailure = (project: Project, error: string) => action(SAVE_PROJECT_FAILURE, { project, error })

export type SaveProjectRequestAction = ReturnType<typeof saveProjectRequest>
export type SaveProjectSuccessAction = ReturnType<typeof saveProjectSuccess>
export type SaveProjectFailureAction = ReturnType<typeof saveProjectFailure>

// Delete project from cloud
export const DELETE_PROJECT_REQUEST = '[Request] Delete project'
export const DELETE_PROJECT_SUCCESS = '[Success] Delete project'
export const DELETE_PROJECT_FAILURE = '[Failure] Delete project'

export const deleteProjectRequest = (id: string) => action(DELETE_PROJECT_REQUEST, { id })
export const deleteProjectSuccess = (id: string) => action(DELETE_PROJECT_SUCCESS, { id })
export const deleteProjectFailure = (id: string, error: string) => action(DELETE_PROJECT_FAILURE, { id, error })

export type DeleteProjectRequestAction = ReturnType<typeof deleteProjectRequest>
export type DeleteProjectSuccessAction = ReturnType<typeof deleteProjectSuccess>
export type DeleteProjectFailureAction = ReturnType<typeof deleteProjectFailure>

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

// Delete deployment
export const DELETE_DEPLOYMENT_REQUEST = '[Request] Delete deployment'
export const DELETE_DEPLOYMENT_SUCCESS = '[Success] Delete deployment'
export const DELETE_DEPLOYMENT_FAILURE = '[Failure] Delete deployment'

export const deleteDeploymentRequest = (id: string) => action(DELETE_DEPLOYMENT_REQUEST, { id })
export const deleteDeploymentSuccess = (id: string) => action(DELETE_DEPLOYMENT_SUCCESS, { id })
export const deleteDeploymentFailure = (id: string, error: string) => action(DELETE_DEPLOYMENT_FAILURE, { id, error })

export type DeleteDeploymentRequestAction = ReturnType<typeof deleteDeploymentRequest>
export type DeleteDeploymentSuccessAction = ReturnType<typeof deleteDeploymentSuccess>
export type DeleteDeploymentFailureAction = ReturnType<typeof deleteDeploymentFailure>
