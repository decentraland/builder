import { action } from 'typesafe-actions'

// Accept terms and conditions

export const ACCEPT_TERMS = 'Accept Terms'

export const acceptTerms = () => action(ACCEPT_TERMS, {})

export type AcceptTermsAction = ReturnType<typeof acceptTerms>

// Register contest email

export const REGISTER_EMAIL = 'Register email'

export const registerEmail = (email: string, projectId: string) => action(REGISTER_EMAIL, { email, projectId })

export type RegisterEmailAction = ReturnType<typeof registerEmail>
