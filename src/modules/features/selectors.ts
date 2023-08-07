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

export const getIsDeployToWorldsEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.DEPLOY_WORLDS)
  } catch (e) {
    return false
  }
}

export const getIsTemplatesEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.SCENE_TEMPLATES)
  } catch (e) {
    return false
  }
}

export const getIsHandsCategoryEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.HANDS_CATEGORY)
  } catch (e) {
    return false
  }
}

export const getIsInspectorEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.WEB_EDITOR)
  } catch (e) {
    return false
  }
}

export const getIsProfileSiteEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.PROFILE)
  } catch (e) {
    return false
  }
}

export const getIsPublishSmartWearablesEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.PUBLISH_SMART_WEARABLES)
  } catch (e) {
    return false
  }
}
