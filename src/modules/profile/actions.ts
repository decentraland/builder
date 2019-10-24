import { action } from 'typesafe-actions'
import { Profile } from './types'

// Load project profile

export const LOAD_PROFILE_REQUEST = '[Request] Load profile'
export const LOAD_PROFILE_SUCCESS = '[Success] Load profile'
export const LOAD_PROFILE_FAILURE = '[Failure] Load profile'

export const loadProfileRequest = (id: string) => action(LOAD_PROFILE_REQUEST, { id })
export const loadProfileSuccess = (profile: Profile) => action(LOAD_PROFILE_SUCCESS, { profile })
export const loadProfileFailure = (error: string) => action(LOAD_PROFILE_FAILURE, { error })

export type LoadProfileRequestAction = ReturnType<typeof loadProfileRequest>
export type LoadProfileSuccessAction = ReturnType<typeof loadProfileSuccess>
export type LoadProfileFailureAction = ReturnType<typeof loadProfileFailure>
