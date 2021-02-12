import { action } from 'typesafe-actions'
import { AuthIdentity } from 'dcl-crypto'
import { ProviderType } from 'decentraland-connect'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'

// Login

export const LOGIN_REQUEST = '[Request] Login'
export const LOGIN_SUCCESS = '[Success] Login'
export const LOGIN_FAILURE = '[Failure] Login'

export const loginRequest = (restoreSession = false, providerType: ProviderType) => action(LOGIN_REQUEST, { restoreSession, providerType })
export const loginSuccess = (wallet: Wallet, identity: AuthIdentity) => action(LOGIN_SUCCESS, { wallet, identity })
export const loginFailure = (error: string) => action(LOGIN_FAILURE, { error })

export type LoginRequestAction = ReturnType<typeof loginRequest>
export type LoginSuccessAction = ReturnType<typeof loginSuccess>
export type LoginFailureAction = ReturnType<typeof loginFailure>

// Logout

export const LOGOUT = 'Logout'
export const logout = () => action(LOGOUT)
export type LogoutAction = ReturnType<typeof logout>

// Generate identity

export const GENERATE_IDENTITY_REQUEST = '[Request] Generate Identity'
export const GENERATE_IDENTITY_SUCCESS = '[Success] Generate Identity'
export const GENERATE_IDENTITY_FAILURE = '[Failure] Generate Identity'

export const generateIdentityRequest = (address: string) => action(GENERATE_IDENTITY_REQUEST, { address })
export const generateIdentitySuccess = (address: string, identity: AuthIdentity) => action(GENERATE_IDENTITY_SUCCESS, { address, identity })
export const generateIdentityFailure = (address: string, error: string) => action(GENERATE_IDENTITY_FAILURE, { address, error })

export type GenerateIdentityRequestAction = ReturnType<typeof generateIdentityRequest>
export type GenerateIdentitySuccessAction = ReturnType<typeof generateIdentitySuccess>
export type GenerateIdentityFailureAction = ReturnType<typeof generateIdentityFailure>

// Destroy identity

export const DESTROY_IDENTITY = 'Destroy Identity'
export const destroyIdentity = (address: string) => action(DESTROY_IDENTITY, { address })
export type DestroyIdentityAction = ReturnType<typeof destroyIdentity>
