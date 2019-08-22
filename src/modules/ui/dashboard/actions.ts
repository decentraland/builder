import { action } from 'typesafe-actions'

export const DISMISS_SYNCED_TOAST = 'Dismiss sync toast'
export const dismissSyncedToast = () => action(DISMISS_SYNCED_TOAST)
export type DismissSyncedToastAction = ReturnType<typeof dismissSyncedToast>

export const DISMISS_SIGN_IN_TOAST = 'Dismiss sign in toast'
export const dismissSignInToast = () => action(DISMISS_SIGN_IN_TOAST)
export type DismissSignInToastAction = ReturnType<typeof dismissSignInToast>

export const SET_SYNC = 'Set sync'
export const setSync = (didSync: boolean) => action(SET_SYNC, { didSync })
export type SetSyncAction = ReturnType<typeof setSync>
