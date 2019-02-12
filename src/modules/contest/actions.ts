import { action } from 'typesafe-actions'
import { UserContest } from './types'

// Accept terms and conditions

export const ACCEPT_TERMS = 'Accept terms'

export const acceptTerms = () => action(ACCEPT_TERMS, {})

export type AcceptTermsAction = ReturnType<typeof acceptTerms>

// Submit project

export const SUBMIT_PROJECT_REQUEST = '[Request] Submit project'
export const SUBMIT_PROJECT_SUCCESS = '[Success] Submit project'
export const SUBMIT_PROJECT_FAILURE = '[Failure] Submit project'

export const submitProjectRequest = (projectId: string, contest: UserContest) => action(SUBMIT_PROJECT_REQUEST, { projectId, contest })
export const submitProjectSuccess = (projectId: string, contest: UserContest) => action(SUBMIT_PROJECT_SUCCESS, { projectId, contest })
export const submitProjectFailure = (error: string) => action(SUBMIT_PROJECT_FAILURE, { error })

export type SubmitProjectRequestAction = ReturnType<typeof submitProjectRequest>
export type SubmitProjectSuccessAction = ReturnType<typeof submitProjectSuccess>
export type SubmitProjectFailureAction = ReturnType<typeof submitProjectFailure>
