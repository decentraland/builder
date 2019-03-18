import { action } from 'typesafe-actions'

// Set email action

export const SET_EMAIL = 'Set email'

export const setEmail = (email: string) => action(SET_EMAIL, { email })

export type SetEmailAction = ReturnType<typeof setEmail>

// Set secret

export const SET_SECRET = 'Set secret'

export const setSecret = (secret: string | null) => action(SET_SECRET, { secret })

export type SetSecretAction = ReturnType<typeof setSecret>
