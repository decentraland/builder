import { getIsFeatureEnabled } from 'decentraland-dapps/dist/modules/features/selectors'
import { ApplicationName } from 'decentraland-dapps/dist/modules/features/types'
import { RootState } from 'modules/common/types'
import { FeatureName } from './types'

export const getIsRaritiesWithOracleEnabled = (state: RootState) =>
  getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.RARITIES_WITH_ORACLE)

export const getIsMaintenanceEnabled = (state: RootState) => {
  // As this is called by the routes component which is rendered when the user enters the application,
  // Features might have not yet been requested and will throw in that case.
  try {
    return getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.MAINTENANCE)
  } catch (e) {
    return false
  }
}
