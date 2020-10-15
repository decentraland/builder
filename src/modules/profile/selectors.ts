import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentPool } from 'modules/pool/selectors'
import { ProfileState } from './reducer'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Avatar } from 'decentraland-ui'

export const getState: (state: RootState) => ProfileState = state => state.profile

export const getData: (state: RootState) => ProfileState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProfileState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getCurrentAuthor = createSelector(getCurrentProject, getCurrentPool, getData, (project, pool, profiles) => {
  if (project && project.ethAddress && profiles[project.ethAddress]) {
    return profiles[project.ethAddress]
  } else if (pool && pool.ethAddress && profiles[pool.ethAddress]) {
    return profiles[pool.ethAddress]
  } else {
    return null
  }
})

export const getAvatar = createSelector<RootState, string | undefined, ProfileState['data'], Avatar | null>(
  getAddress,
  getData,
  (address, profileData) => {
    if (address) {
      const profile = profileData[address]
      if (profile) {
        const avatar = profile.avatars[0]
        if (avatar) {
          return avatar
        }
      }
    }
    return null
  }
)

export const getName = createSelector<RootState, Avatar | null, string | null>(getAvatar, avatar => {
  return avatar && avatar.name ? avatar.name : null
})
