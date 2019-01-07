import { RootState } from 'modules/common/types'
import { ProjectState } from 'modules/project/reducer'

export const getState: (state: RootState) => ProjectState = state => state.project

export const getData: (state: RootState) => ProjectState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => ProjectState['error'] = state => getState(state).error
