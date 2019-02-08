import { RootState } from 'modules/common/types'
import { ContestState } from './reducer'
import { getCurrentProject } from 'modules/project/selectors'

export const getState: (state: RootState) => ContestState = state => state.contest

export const hasAcceptedTerms: (state: RootState) => ContestState['hasAcceptedTerms'] = state => getState(state).hasAcceptedTerms

export const hasSubmittedCurrentProject: (state: RootState) => boolean = state => {
  const currentProject = getCurrentProject(state)
  return currentProject ? hasSubmittedProject(state, currentProject.id) : false
}
export const hasSubmittedProject: (state: RootState, projectId: string) => boolean = (state, projectId) =>
  !!getState(state).projects[projectId]
