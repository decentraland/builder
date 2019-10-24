import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { ProfileState } from './reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Profile } from './types'

export const getState: (state: RootState) => ProfileState = state => state.profile

export const getData: (state: RootState) => ProfileState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProfileState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getCurrentAuthor = createSelector<RootState, Project | null, ProfileState['data'], Profile | null>(
  getCurrentProject,
  getData,
  (project, profiles) => project && project.userId && profiles[project.userId] || null
)
