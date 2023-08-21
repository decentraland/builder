import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.inspector
export const isScreenshotEnabled = (state: RootState) => getState(state).screenshotEnabled
export const isReloading = (state: RootState) => getState(state).isReloading
