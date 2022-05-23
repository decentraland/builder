import { getIsFeatureEnabled } from 'decentraland-dapps/dist/modules/features/selectors'
import { RootState } from 'modules/common/types'
import { getIsMaintenanceEnabled } from './selectors'

jest.mock('decentraland-dapps/dist/modules/features/selectors')

const mockGetIsFeatureEnabled = getIsFeatureEnabled as jest.MockedFunction<typeof getIsFeatureEnabled>

describe('when getting if maintainance is enabled', () => {
  describe('when getIsFeatureEnabled returns true', () => {
    beforeEach(() => {
      mockGetIsFeatureEnabled.mockReturnValueOnce(true)
    })

    it('should return true', () => {
      const state: RootState = {} as any
      const result = getIsMaintenanceEnabled(state)

      expect(result).toEqual(true)
    })
  })

  describe('when getIsFeatureEnabled returns false', () => {
    beforeEach(() => {
      mockGetIsFeatureEnabled.mockReturnValueOnce(false)
    })

    it('should return false', () => {
      const state: RootState = {} as any
      const result = getIsMaintenanceEnabled(state)

      expect(result).toEqual(false)
    })
  })

  describe('when getIsFeatureEnabled throws an exception', () => {
    beforeEach(() => {
      mockGetIsFeatureEnabled.mockImplementationOnce(() => {
        throw new Error('error')
      })
    })

    it('should return false', () => {
      const state: RootState = {} as any
      const result = getIsMaintenanceEnabled(state)

      expect(result).toEqual(false)
    })
  })
})
