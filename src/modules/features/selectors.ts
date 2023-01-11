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

export const getIsCampaignEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.CAMPAIGN)
  } catch (e) {
    return false
  }
}
