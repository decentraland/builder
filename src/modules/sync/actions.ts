import { action } from 'typesafe-actions'
import { Project } from 'modules/project/types'

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

export const saveProjectRequest = (project: Project, debounce = true) => action(SAVE_PROJECT_REQUEST, { project, debounce })
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
