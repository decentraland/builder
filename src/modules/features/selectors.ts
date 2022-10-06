import { getIsFeatureEnabled } from 'decentraland-dapps/dist/modules/features/selectors'
import { ApplicationName } from 'decentraland-dapps/dist/modules/features/types'
import { RootState } from 'modules/common/types'
import { FeatureName } from './types'

// These methods might be called before the features have been requested.
// In that case the method will throw, so we just return false

export const getIsMaintenanceEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.MAINTENANCE)
  } catch (e) {
    return false
  }
}

export const getIsRentalsEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.RENTALS)
  } catch (e) {
    return false
  }
}

export const getIsEmotePlayModeEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.EMOTE_PLAY_MODE)
  } catch (e) {
    return false
  }
}

export const getIsMvmfEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.MVMF)
  } catch (e) {
    return false
  }
}
