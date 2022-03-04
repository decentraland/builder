import { createSelector } from 'reselect'
import { Avatar } from '@dcl/schemas'
import { ProfileState } from 'decentraland-dapps/dist/modules/profile/reducer'
import { getData } from 'decentraland-dapps/dist/modules/profile/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCurrentPool } from 'modules/pool/selectors'
import { getCurrentProject } from 'modules/project/selectors'

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
