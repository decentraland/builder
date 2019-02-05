import { action } from 'typesafe-actions'

// Register contest email

export const REGISTER_EMAIL = 'Register email'

export const registerEmail = (email: string) => action(REGISTER_EMAIL, { email })

export type RegisterEmailAction = ReturnType<typeof registerEmail>
