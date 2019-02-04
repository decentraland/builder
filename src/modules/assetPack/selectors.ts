import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.assetPack
export const getData = (state: RootState) => getState(state).data
export const getError = (state: RootState) => getState(state).error
export const isLoading = (state: RootState) => getState(state).loading.length > 0
