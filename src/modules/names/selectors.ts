import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.names
export const getLoading = (state: RootState) => getState(state).loading
