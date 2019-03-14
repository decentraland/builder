import { action } from 'typesafe-actions'

// Set email action

export const SET_EMAIL = 'Set email'

export const setEmail = (email: string) => action(SET_EMAIL, { email })

export type SetEmailAction = ReturnType<typeof setEmail>
