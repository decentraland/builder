import { renderHook } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getIsCancelledOrdersBannerEnabled } from 'modules/features/selectors'
import { fetchCancelledItemOrdersRequest } from './actions'
import { useFetchCancelledItemOrders } from './hooks'
import { getFetchedFor } from './selectors'

jest.mock('react-redux', () => ({
  ...jest.requireActual<typeof import('react-redux')>('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))
jest.mock('decentraland-dapps/dist/modules/wallet/selectors')
jest.mock('modules/features/selectors')
jest.mock('./selectors')

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>
const mockGetAddress = getAddress as jest.MockedFunction<typeof getAddress>
const mockGetIsEnabled = getIsCancelledOrdersBannerEnabled as jest.MockedFunction<typeof getIsCancelledOrdersBannerEnabled>
const mockGetFetchedFor = getFetchedFor as jest.MockedFunction<typeof getFetchedFor>

let dispatch: jest.Mock
let result: { current: boolean }

beforeEach(() => {
  dispatch = jest.fn()
  mockUseDispatch.mockReturnValue(dispatch)
  mockUseSelector.mockImplementation(selector => selector({}))
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('when using the hook that fetches the cancelled item orders', () => {
  describe('and the feature is disabled', () => {
    beforeEach(() => {
      mockGetIsEnabled.mockReturnValue(false)
      mockGetAddress.mockReturnValue('0xaddress')
      mockGetFetchedFor.mockReturnValue(null)
      result = renderHook(() => useFetchCancelledItemOrders()).result
    })

    it('should not fetch the orders', () => {
      expect(dispatch).not.toHaveBeenCalled()
    })

    it('should return that the feature is disabled', () => {
      expect(result.current).toBe(false)
    })
  })

  describe('and the feature is enabled', () => {
    beforeEach(() => {
      mockGetIsEnabled.mockReturnValue(true)
    })

    describe('and there is no connected wallet', () => {
      beforeEach(() => {
        mockGetAddress.mockReturnValue(undefined)
        mockGetFetchedFor.mockReturnValue(null)
        result = renderHook(() => useFetchCancelledItemOrders()).result
      })

      it('should not fetch the orders', () => {
        expect(dispatch).not.toHaveBeenCalled()
      })

      it('should return that the feature is enabled', () => {
        expect(result.current).toBe(true)
      })
    })

    describe('and the orders were not fetched for the connected wallet', () => {
      beforeEach(() => {
        mockGetAddress.mockReturnValue('0xaddress')
        mockGetFetchedFor.mockReturnValue('0xanother')
        renderHook(() => useFetchCancelledItemOrders())
      })

      it('should fetch the orders of the connected wallet', () => {
        expect(dispatch).toHaveBeenCalledWith(fetchCancelledItemOrdersRequest('0xaddress'))
      })
    })

    describe('and the orders were already fetched for the connected wallet', () => {
      beforeEach(() => {
        mockGetAddress.mockReturnValue('0xaddress')
        mockGetFetchedFor.mockReturnValue('0xaddress')
        renderHook(() => useFetchCancelledItemOrders())
      })

      it('should not fetch the orders again', () => {
        expect(dispatch).not.toHaveBeenCalled()
      })
    })
  })
})
