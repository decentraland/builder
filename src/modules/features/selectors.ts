import { getIsFeatureEnabled } from 'decentraland-dapps/dist/modules/features/selectors'
import { ApplicationName } from 'decentraland-dapps/dist/modules/features/types'
import { RootState } from 'modules/common/types'
import { FeatureName } from './types'

export const getIsRaritiesWithOracleEnabled = (state: RootState) =>
  getIsFeatureEnabled(state, ApplicationName.BUILDER, FeatureName.RARITIES_WITH_ORACLE)
