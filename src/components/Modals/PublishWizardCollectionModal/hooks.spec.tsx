import { renderHook, act, waitFor } from '@testing-library/react'
import { getThirdPartyPrice } from 'modules/thirdParty/utils'
import { ThirdPartyPrice } from 'modules/thirdParty/types'
import { useThirdPartyPrice } from './hooks'

jest.mock('modules/thirdParty/utils')

const mockGetThirdPartyPrice = getThirdPartyPrice as jest.MockedFn<typeof getThirdPartyPrice>

describe('when using the third party price hook', () => {
  describe('and the price is not being fetched', () => {
    it('should return the isFetchingPrice property as false', () => {
      const { result } = renderHook(() => useThirdPartyPrice())
      expect(result.current.isFetchingPrice).toBe(false)
    })
  })

  describe('and the price is being fetched', () => {
    it('should return the isFetchingPrice property as true', async () => {
      let resolvePrice: (value: ThirdPartyPrice) => void
      const pricePromise = new Promise<ThirdPartyPrice>(resolve => {
        resolvePrice = resolve
      })
      mockGetThirdPartyPrice.mockReturnValueOnce(pricePromise)

      const { result } = renderHook(() => useThirdPartyPrice())

      act(() => {
        void result.current.fetchThirdPartyPrice()
      })

      await waitFor(() => {
        expect(result.current.isFetchingPrice).toBe(true)
      })

      // Cleanup: resolve the promise
      resolvePrice!({ item: { mana: '1', usd: '1' }, programmatic: { mana: '1', usd: '1', minSlots: '1' } })
    })
  })

  describe('and the price is fetched successfully', () => {
    it('should return the third party price and set the isFetchingPrice property as false', async () => {
      const thirdPartyPrice: ThirdPartyPrice = {
        item: {
          mana: '1',
          usd: '2'
        },
        programmatic: {
          mana: '3',
          usd: '4',
          minSlots: '1'
        }
      }

      mockGetThirdPartyPrice.mockResolvedValueOnce(thirdPartyPrice)
      const { result } = renderHook(() => useThirdPartyPrice())

      await act(async () => {
        await result.current.fetchThirdPartyPrice()
      })

      expect(result.current.isFetchingPrice).toBe(false)
      expect(result.current.thirdPartyPrice).toEqual(thirdPartyPrice)
    })
  })

  describe('and the price is not fetched successfully', () => {
    it('should return the price as undefined', async () => {
      mockGetThirdPartyPrice.mockRejectedValueOnce(new Error('Failed to fetch price'))
      const { result } = renderHook(() => useThirdPartyPrice())

      await act(async () => {
        await result.current.fetchThirdPartyPrice()
      })

      expect(result.current.isFetchingPrice).toBe(false)
      expect(result.current.thirdPartyPrice).toBeUndefined()
    })
  })
})
