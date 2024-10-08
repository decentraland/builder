import { renderHook, act } from '@testing-library/react-hooks'
import { getThirdPartyPrice } from 'modules/thirdParty/utils'
import { ThirdPartyPrice } from 'modules/thirdParty/types'
import { useThirdPartyPrice, UseThirdPartyPriceResult } from './hooks'

jest.mock('modules/thirdParty/utils')

const mockGetThirdPartyPrice = getThirdPartyPrice as jest.MockedFn<typeof getThirdPartyPrice>

describe('when using the third party price hook', () => {
  let renderedHook: ReturnType<typeof renderHook>
  let currentResult: UseThirdPartyPriceResult

  describe('and the price is not being fetched', () => {
    beforeEach(() => {
      renderedHook = renderHook(() => useThirdPartyPrice())
      currentResult = renderedHook.result.current as UseThirdPartyPriceResult
    })

    it('should return the isFetchingPrice property as false', () => {
      expect(currentResult.isFetchingPrice).toBe(false)
    })
  })

  describe('and the price is being fetched', () => {
    let pricePromiseResolve: (value: unknown) => void
    let promiseOfAct: Promise<unknown>

    beforeEach(() => {
      const pricePromise = new Promise(resolve => (pricePromiseResolve = resolve))
      mockGetThirdPartyPrice.mockReturnValueOnce(pricePromise as Promise<ThirdPartyPrice>)
      renderedHook = renderHook(() => useThirdPartyPrice())
      currentResult = renderedHook.result.current as UseThirdPartyPriceResult
      promiseOfAct = act(() => currentResult.fetchThirdPartyPrice())
      currentResult = renderedHook.result.current as UseThirdPartyPriceResult
    })

    it('should return the isFetchingPrice property as true', () => {
      expect(currentResult.isFetchingPrice).toBe(true)
      pricePromiseResolve(undefined)
      return promiseOfAct
    })
  })

  describe('and the price is fetched successfully', () => {
    let thirdPartyPrice: ThirdPartyPrice

    beforeEach(async () => {
      thirdPartyPrice = {
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
      renderedHook = renderHook(() => useThirdPartyPrice())
      currentResult = renderedHook.result.current as UseThirdPartyPriceResult
      await act(() => currentResult.fetchThirdPartyPrice())
      currentResult = renderedHook.result.current as UseThirdPartyPriceResult
    })

    it('should return the third party price and set the isFetchingPrice property as false', () => {
      expect(currentResult.isFetchingPrice).toBe(false)
      expect(currentResult.thirdPartyPrice).toEqual(thirdPartyPrice)
    })
  })

  describe('and the price is not fetched successfully', () => {
    beforeEach(async () => {
      mockGetThirdPartyPrice.mockRejectedValueOnce(new Error('Failed to fetch price'))
      renderedHook = renderHook(() => useThirdPartyPrice())
      currentResult = renderedHook.result.current as UseThirdPartyPriceResult
      await act(() => currentResult.fetchThirdPartyPrice())
      currentResult = renderedHook.result.current as UseThirdPartyPriceResult
    })

    it('should return the price as undefined and ', () => {
      expect(currentResult.isFetchingPrice).toBe(false)
      expect(currentResult.thirdPartyPrice).toBeUndefined()
    })
  })
})
