import { RootState } from 'modules/common/types'
import { ContestState } from './reducer'
import { getCurrentProject } from 'modules/project/selectors'

export const getState: (state: RootState) => ContestState = state => state.contest

export const getData: (state: RootState) => ContestState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => ContestState['error'] = state => getState(state).error

export const hasAcceptedTerms: (state: RootState) => boolean = state => getData(state).hasAcceptedTerms

export const hasSubmittedProject: (state: RootState, projectId: string) => boolean = (state, projectId) =>
  !!getData(state).projects[projectId]

export const hasSubmittedCurrentProject: (state: RootState) => boolean = state => {
  const currentProject = getCurrentProject(state)
  return currentProject ? hasSubmittedProject(state, currentProject.id) : false
}
