import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.ens
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getSubdomainList = (state: RootState) => getState(state).subdomainList
