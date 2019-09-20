import { action } from 'typesafe-actions'
import { AuthData, LoginOptions } from './types'

// Logout
export const LOGIN = 'Login'
export const login = (options: LoginOptions = {}) => action(LOGIN, options)
export type LoginAction = ReturnType<typeof login>

// Logout
export const LOGOUT = 'Logout'
export const logout = () => action(LOGOUT)
export type LogoutAction = ReturnType<typeof logout>

// Auth
export const AUTH_REQUEST = '[Request] Auth'
export const AUTH_SUCCESS = '[Success] Auth'
export const AUTH_FAILURE = '[Failure] Auth'

export const authRequest = () => action(AUTH_REQUEST)
export const authSuccess = (data: AuthData, options: LoginOptions) => {
  return action(AUTH_SUCCESS, { data, options })
}
export const authFailure = (error: string) => action(AUTH_FAILURE, { error })

export type AuthRequestAction = ReturnType<typeof authRequest>
export type AuthSuccessAction = ReturnType<typeof authSuccess>
export type AuthFailureAction = ReturnType<typeof authFailure>
