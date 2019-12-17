import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentPool } from 'modules/pool/selectors'
import { ProfileState } from './reducer'

export const getState: (state: RootState) => ProfileState = state => state.profile

export const getData: (state: RootState) => ProfileState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProfileState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getCurrentAuthor = createSelector(
  getCurrentProject,
  getCurrentPool,
  getData,
  (project, pool, profiles) => {
    if (project && project.userId && profiles[project.userId]) {
      return profiles[project.userId]
    } else if (pool && pool.userId && profiles[pool.userId]) {
      return profiles[pool.userId]
    } else {
      return null
    }
  }
)
