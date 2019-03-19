import { action } from 'typesafe-actions'

// Set id

export const SET_USER_ID = 'Set user id'

export const setUserId = (id: string) => action(SET_USER_ID, { id })

export type SetUserIdAction = ReturnType<typeof setUserId>

// Set email action

export const SET_USER_EMAIL = 'Set user email'

export const setUserEmail = (email: string) => action(SET_USER_EMAIL, { email })

export type SetUserEmailAction = ReturnType<typeof setUserEmail>
