import { Avatar } from 'decentraland-ui'
import { action } from 'typesafe-actions'
import { Profile } from './types'

// Load project profile

export const LOAD_PROFILE_REQUEST = '[Request] Load profile'
export const LOAD_PROFILE_SUCCESS = '[Success] Load profile'
export const LOAD_PROFILE_FAILURE = '[Failure] Load profile'

export const loadProfileRequest = (address: string) => action(LOAD_PROFILE_REQUEST, { address })
export const loadProfileSuccess = (address: string, profile: Profile) => action(LOAD_PROFILE_SUCCESS, { address, profile })
export const loadProfileFailure = (address: string, error: string) => action(LOAD_PROFILE_FAILURE, { address, error })

export type LoadProfileRequestAction = ReturnType<typeof loadProfileRequest>
export type LoadProfileSuccessAction = ReturnType<typeof loadProfileSuccess>
export type LoadProfileFailureAction = ReturnType<typeof loadProfileFailure>

// Change Profile
export const CHANGE_PROFILE_REQUEST = '[Request] Change Profile'
export const CHANGE_PROFILE_SUCCESS = '[Success] Change Profile'
export const CHANGE_PROFILE_FAILURE = '[Failure] Change Profile'

export const changeProfileRequest = (
  address: string,
  profile: Partial<Profile> & { avatars: Partial<Avatar>[]; content?: any[]; metadata?: any[] }
) => action(CHANGE_PROFILE_REQUEST, { address, profile })
export const changeProfileSuccess = (address: string, profile: Profile) => action(CHANGE_PROFILE_SUCCESS, { address, profile })
export const changeProfileFailure = (address: string, error: string) => action(CHANGE_PROFILE_FAILURE, { address, error })

export type ChangeProfileRequestAction = ReturnType<typeof changeProfileRequest>
export type ChangeProfileSuccessAction = ReturnType<typeof changeProfileSuccess>
export type ChangeProfileFailureAction = ReturnType<typeof changeProfileFailure>

// Set Alias
export const SET_ALIAS_REQUEST = '[Request] Change Profile'
export const SET_ALIAS_SUCCESS = '[Success] Change Profile'
export const SET_ALIAS_FAILURE = '[Failure] Change Profile'

export const setAliasRequest = (address: string, name: string) => action(SET_ALIAS_REQUEST, { address, name })
export const setAliasSuccess = (address: string, profile: Profile) => action(SET_ALIAS_SUCCESS, { address, profile })
export const setAliasFailure = (address: string, error: string) => action(SET_ALIAS_FAILURE, { address, error })

export type SetAliasRequestAction = ReturnType<typeof setAliasRequest>
export type SetAliasSuccessAction = ReturnType<typeof setAliasSuccess>
export type SetAliasFailureAction = ReturnType<typeof setAliasFailure>
