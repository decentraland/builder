import { action } from 'typesafe-actions'
import { User } from './types'

// Set id

export const SET_USER_ID = 'Set user id'

export const setUserId = (id: string) => action(SET_USER_ID, { id })

export type SetUserIdAction = ReturnType<typeof setUserId>

// Set email action

export const SET_USER_EMAIL = 'Set user email'

export const setUserEmail = (email: string) => action(SET_USER_EMAIL, { email })

export type SetUserEmailAction = ReturnType<typeof setUserEmail>

// Set user profile

export const SET_USER_PROFILE = 'Set user profile'

export const setUserProfile = (data: Partial<User>) => action(SET_USER_PROFILE, { data })

export type SetUserProfileAction = ReturnType<typeof setUserProfile>
