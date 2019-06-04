import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.deployment
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getError = (state: RootState) => getState(state).error
export const getThumbnail = (state: RootState) => getState(state).data.thumbnail
export const getProgress = (state: RootState) => getState(state).data.progress
