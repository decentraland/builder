import { action } from 'typesafe-actions'

// Open Login
export const OPEN_LOGIN_MODAL = 'Open Login Modal'
export const openLogin = () => action(OPEN_LOGIN_MODAL, {})
export type OpenLoginModalAction = ReturnType<typeof openLogin>
