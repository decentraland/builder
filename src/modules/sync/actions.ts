import { action } from 'typesafe-actions'
import { Project } from 'modules/project/types'

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
