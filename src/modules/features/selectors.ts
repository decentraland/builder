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

export const getIsCreateSceneOnlySDK7Enabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.CREATE_SCENE_ONLY_SDK7)
  } catch (e) {
    return false
  }
}

export const getIsPublishCollectionsWertEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.PUBLISH_COLLECTIONS_WERT)
  } catch (e) {
    return false
  }
}

export const getIsVrmOptOutEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.VRM_OPTOUT)
  } catch (e) {
    return false
  }
}

export const getIsWearableUtilityEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.WEARABLE_UTILITY)
  } catch (e) {
    return false
  }
}

export const getIsWorldContributorEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.WORLD_CONTRIBUTOR)
  } catch (e) {
    return false
  }
}

export const getIsLinkedWearablesV2Enabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.LINKED_WEARABLES_V2)
  } catch (e) {
    return false
  }
}

export const getIsLinkedWearablesPaymentsEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.LINKED_WEARABLES_PAYMENTS)
  } catch (e) {
    return false
  }
}

export const getIsOffchainPublicItemOrdersEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.OFFCHAIN_PUBLIC_ITEM_ORDERS)
  } catch (e) {
    return false
  }
}
