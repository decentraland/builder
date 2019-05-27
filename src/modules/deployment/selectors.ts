import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.assetPack
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getError = (state: RootState) => getState(state).error
