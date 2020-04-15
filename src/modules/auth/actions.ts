import { action } from 'typesafe-actions'
import { AuthData, LoginOptions } from './types'

// Logout
export const LEGACY_LOGIN = '[Legacy] Login'
export const LEGACY_login = (options: LoginOptions = {}) => action(LEGACY_LOGIN, options)
export type LEGACY_LoginAction = ReturnType<typeof LEGACY_login>

// Logout
export const LEGACY_LOGOUT = '[Legacy] Logout'
export const LEGACY_logout = () => action(LEGACY_LOGOUT)
export type LEGACY_LogoutAction = ReturnType<typeof LEGACY_logout>

// Auth
export const LEGACY_AUTH_REQUEST = '[Request] Auth'
export const LEGACY_AUTH_SUCCESS = '[Success] Auth'
export const LEGACY_AUTH_FAILURE = '[Failure] Auth'

export const authRequestLegacy = () => action(LEGACY_AUTH_REQUEST)
export const authSuccessLegacy = (data: AuthData, options: LoginOptions) => {
  return action(LEGACY_AUTH_SUCCESS, { data, options })
}
export const authFailureLegacy = (error: string) => action(LEGACY_AUTH_FAILURE, { error })

export type AuthRequestLegacyAction = ReturnType<typeof authRequestLegacy>
export type AuthSuccessLegacyAction = ReturnType<typeof authSuccessLegacy>
export type AuthFailureLegacyAction = ReturnType<typeof authFailureLegacy>
