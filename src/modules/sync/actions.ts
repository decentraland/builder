import { action } from 'typesafe-actions'

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
