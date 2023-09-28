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

export const getIsNewNavbarDropdownEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.NEW_NAVBAR_DROPDOWN)
  } catch (e) {
    return false
  }
}

export const getEmotesV2Enabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.EMOTES_V2)
  } catch (e) {
    return false
  }
}

export const getIsSmartItemsEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.SMART_ITEMS)
  } catch (e) {
    return false
  }
}

export const getIsWorldsForEnsOwnersEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.WORLDS_FOR_ENS_OWNERS)
  } catch (e) {
    return false
  }
}
