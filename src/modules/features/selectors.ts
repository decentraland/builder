import { getIsFeatureEnabled } from 'decentraland-dapps/dist/modules/features/selectors'
import { ApplicationName } from 'decentraland-dapps/dist/modules/features/types'
import { RootState } from 'modules/common/types'
import { FeatureName } from './types'

// As this is called by the routes component which is rendered when the user enters the application,
// Features might have not yet been requested and will throw in that case.

export const getIsMaintenanceEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.MAINTENANCE)
  } catch (e) {
    return false
  }
}

export const getIsEmotesFlowEnabled = (state: RootState) => {
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.NEW_EMOTE_FLOW)
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
