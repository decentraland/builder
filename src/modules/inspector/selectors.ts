import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.inspector
export const isScreenshotEnabled = (state: RootState) => getState(state).screenshotEnabled
