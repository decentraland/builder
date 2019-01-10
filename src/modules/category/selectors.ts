import { RootState } from 'modules/common/types'
import { CategoryState } from 'modules/category/reducer'

export const getState: (state: RootState) => CategoryState = state => state.category

export const getData: (state: RootState) => CategoryState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => CategoryState['error'] = state => getState(state).error
