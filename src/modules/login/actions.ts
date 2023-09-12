import { action } from 'typesafe-actions'

// Open Login
export const OPEN_LOGIN_MODAL = 'Open Login'
export const openLogin = () => action(OPEN_LOGIN_MODAL, {})
export type OpenLoginAction = ReturnType<typeof openLogin>
