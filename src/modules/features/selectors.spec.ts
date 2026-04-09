import { getIsFeatureEnabled, hasLoadedInitialFlags } from 'decentraland-dapps/dist/modules/features/selectors'
import { ApplicationName } from 'decentraland-dapps/dist/modules/features/types'
import { RootState } from 'modules/common/types'
import {
  getIsCampaignEnabled,
  getIsCreateSceneOnlySDK7Enabled,
  getIsLinkedWearablesPaymentsEnabled,
  getIsLinkedWearablesV2Enabled,
  getIsMaintenanceEnabled,
  getIsOffchainPublicItemOrdersEnabled,
  getIsPublishCollectionsWertEnabled,
  getIsSocialEmotesEnabled,
  getIsUnityWearablePreviewEnabled,
  getIsCreditsForCollectionsFeeEnabled,
  getIsVrmOptOutEnabled,
  getIsWearableUtilityEnabled,
  getIsWorldContributorEnabled
} from './selectors'
import { FeatureName } from './types'

jest.mock('decentraland-dapps/dist/modules/features/selectors')

const mockGetIsFeatureEnabled = getIsFeatureEnabled as jest.MockedFunction<typeof getIsFeatureEnabled>
const mockHasLoadedInitialFlags = hasLoadedInitialFlags as jest.MockedFunction<typeof hasLoadedInitialFlags>
let state: RootState

beforeEach(() => {
  state = {} as any
  mockGetIsFeatureEnabled.mockClear()
  mockHasLoadedInitialFlags.mockClear()
  mockHasLoadedInitialFlags.mockReturnValue(true)
})

describe('when getting if maintainance is enabled', () => {
  describe('when getIsFeatureEnabled returns true', () => {
    beforeEach(() => {
      mockGetIsFeatureEnabled.mockReturnValueOnce(true)
    })

    it('should return true', () => {
      const result = getIsMaintenanceEnabled(state)

      expect(result).toEqual(true)
    })
  })

  describe('when getIsFeatureEnabled returns false', () => {
    beforeEach(() => {
      mockGetIsFeatureEnabled.mockReturnValueOnce(false)
    })

    it('should return false', () => {
      const result = getIsMaintenanceEnabled(state)

      expect(result).toEqual(false)
    })
  })

  describe('when hasLoadedInitialFlags returns false', () => {
    beforeEach(() => {
      mockHasLoadedInitialFlags.mockReturnValueOnce(false)
    })

    it('should return false', () => {
      const result = getIsMaintenanceEnabled(state)

      expect(result).toEqual(false)
    })
  })
})

const ffSelectors = [
  { selector: getIsCampaignEnabled, app: ApplicationName.BUILDER, feature: FeatureName.CAMPAIGN },
  { selector: getIsCreateSceneOnlySDK7Enabled, app: ApplicationName.BUILDER, feature: FeatureName.CREATE_SCENE_ONLY_SDK7 },
  { selector: getIsPublishCollectionsWertEnabled, app: ApplicationName.BUILDER, feature: FeatureName.PUBLISH_COLLECTIONS_WERT },
  { selector: getIsVrmOptOutEnabled, app: ApplicationName.BUILDER, feature: FeatureName.VRM_OPTOUT },
  { selector: getIsWearableUtilityEnabled, app: ApplicationName.DAPPS, feature: FeatureName.WEARABLE_UTILITY },
  { selector: getIsWorldContributorEnabled, app: ApplicationName.BUILDER, feature: FeatureName.WORLD_CONTRIBUTOR },
  { selector: getIsLinkedWearablesV2Enabled, app: ApplicationName.BUILDER, feature: FeatureName.LINKED_WEARABLES_V2 },
  { selector: getIsLinkedWearablesPaymentsEnabled, app: ApplicationName.BUILDER, feature: FeatureName.LINKED_WEARABLES_PAYMENTS },
  { selector: getIsOffchainPublicItemOrdersEnabled, app: ApplicationName.DAPPS, feature: FeatureName.OFFCHAIN_PUBLIC_ITEM_ORDERS },
  { selector: getIsUnityWearablePreviewEnabled, app: ApplicationName.DAPPS, feature: FeatureName.UNITY_WEARABLE_PREVIEW },
  { selector: getIsCreditsForCollectionsFeeEnabled, app: ApplicationName.BUILDER, feature: FeatureName.CREDITS_FOR_COLLECTIONS_FEE },
  { selector: getIsSocialEmotesEnabled, app: ApplicationName.DAPPS, feature: FeatureName.SOCIAL_EMOTES }
]

ffSelectors.forEach(({ selector, app, feature }) => {
  describe(`when getting if ${feature} is enabled`, () => {
    describe('when getIsFeatureEnabled returns true', () => {
      beforeEach(() => {
        mockGetIsFeatureEnabled.mockReturnValueOnce(true)
      })

      it('should return true', () => {
        const result = selector(state)

        expect(result).toEqual(true)
        expect(mockGetIsFeatureEnabled).toHaveBeenCalledWith(state, app, feature)
      })
    })

    describe('when getIsFeatureEnabled returns false', () => {
      beforeEach(() => {
        mockGetIsFeatureEnabled.mockReturnValueOnce(false)
      })

      it('should return false', () => {
        const result = selector(state)

        expect(result).toEqual(false)
        expect(mockGetIsFeatureEnabled).toHaveBeenCalledWith(state, app, feature)
      })
    })

    describe('when hasLoadedInitialFlags returns false', () => {
      beforeEach(() => {
        mockHasLoadedInitialFlags.mockReturnValueOnce(false)
      })

      it('should return false', () => {
        const result = selector(state)

        expect(result).toEqual(false)
        expect(mockGetIsFeatureEnabled).not.toHaveBeenCalled()
      })
    })
  })
})
