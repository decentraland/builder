import { getIsFeatureEnabled, hasLoadedInitialFlags } from 'decentraland-dapps/dist/modules/features/selectors'
import { ApplicationName } from 'decentraland-dapps/dist/modules/features/types'
import { RootState } from 'modules/common/types'
import { FeatureName } from './types'

export const getIsMaintenanceEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.MAINTENANCE)
  }
  return false
}

export const getIsCampaignEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.CAMPAIGN)
  }
  return false
}

export const getIsCreateSceneOnlySDK7Enabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.CREATE_SCENE_ONLY_SDK7)
  }
  return false
}

export const getIsPublishCollectionsWertEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.PUBLISH_COLLECTIONS_WERT)
  }
  return false
}

export const getIsVrmOptOutEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.VRM_OPTOUT)
  }
  return false
}

export const getIsWearableUtilityEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.WEARABLE_UTILITY)
  }
  return false
}

export const getIsWorldContributorEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.WORLD_CONTRIBUTOR)
  }
  return false
}

export const getIsLinkedWearablesV2Enabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.LINKED_WEARABLES_V2)
  }
  return false
}

export const getIsLinkedWearablesPaymentsEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.LINKED_WEARABLES_PAYMENTS)
  }
  return false
}

export const getIsOffchainPublicItemOrdersEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.OFFCHAIN_PUBLIC_ITEM_ORDERS)
  }
  return false
}

export const getIsUnityWearablePreviewEnabled = (state: RootState) => {
  if (hasLoadedInitialFlags(state)) {
    return getIsFeatureEnabled(state, ApplicationName.DAPPS, FeatureName.UNITY_WEARABLE_PREVIEW)
  }
  return false
}
