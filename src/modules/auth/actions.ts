/* tslint:disable */

import { action } from 'typesafe-actions'
import { AuthData, LoginOptions, Auth0MigrationResult } from './types'

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
export const authSuccessLegacy = (data: AuthData, options: LoginOptions) => action(LEGACY_AUTH_SUCCESS, { data, options })

export const authFailureLegacy = (error: string) => action(LEGACY_AUTH_FAILURE, { error })

export type AuthRequestLegacyAction = ReturnType<typeof authRequestLegacy>
export type AuthSuccessLegacyAction = ReturnType<typeof authSuccessLegacy>
export type AuthFailureLegacyAction = ReturnType<typeof authFailureLegacy>

export const MIGRATION_REQUEST = '[Request] Migrate Auth0'
export const MIGRATION_SUCCESS = '[Success] Migrate Auth0'
export const MIGRATION_FAILURE = '[Failure] Migrate Auth0'

export const migrationRequest = () => action(MIGRATION_REQUEST)
export const migrationSuccess = (result: Auth0MigrationResult) => action(MIGRATION_SUCCESS, { result })
export const migrationFailure = (error: string) => action(MIGRATION_FAILURE, { error })

export type MigrationRequestAction = ReturnType<typeof migrationRequest>
export type MigrationSuccessAction = ReturnType<typeof migrationSuccess>
export type MigrationFailureAction = ReturnType<typeof migrationFailure>
