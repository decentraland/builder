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

export const getIsSDK7TemplatesEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.SDK7_TEMPLATES)
  } catch (e) {
    return false
  }
}

export const getIsCreateSceneOnlySDK7Enabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.CREATE_SCENE_ONLY_SDK7)
  } catch (e) {
    return false
  }
}

export const getIsAuthDappEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.AUTH_DAPP)
  } catch (e) {
    return false
  }
}

export const getIsNavbarV2Enabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.NAVBAR_V2)
  } catch (e) {
    return false
  }
}

export const getIsEnsAddressEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.ENS_ADDRESS)
  } catch (e) {
    return false
  }
}
