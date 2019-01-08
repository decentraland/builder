import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.entity

export const getData = (state: RootState) => getState(state).data
