import { action } from 'typesafe-actions'
import { AuthData } from './types'

// Logout
export const LOGIN = 'Login'
export const login = (redirectUrl?: string) => action(LOGIN, { redirectUrl })
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
export const authSuccess = (data: AuthData, redirectUrl: string | null) => action(AUTH_SUCCESS, { data, redirectUrl })
export const authFailure = (error: string) => action(AUTH_FAILURE, { error })

export type AuthRequestAction = ReturnType<typeof authRequest>
export type AuthSuccessAction = ReturnType<typeof authSuccess>
export type AuthFailureAction = ReturnType<typeof authFailure>
