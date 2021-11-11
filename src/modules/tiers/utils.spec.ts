import { ThirdPartyItemTier } from './types'
import { sortTiers } from './utils'

describe('when sorting a tier A and B', () => {
  let thirdPartyItemTierA: ThirdPartyItemTier
  let thirdPartyItemTierB: ThirdPartyItemTier

  describe('and the tier A has a lower value (numerically) than a tier B', () => {
    beforeEach(() => {
      thirdPartyItemTierA = {
        id: '1',
        value: '100',
        price: '1000'
      }
      thirdPartyItemTierB = {
        id: '2',
        value: '200',
        price: '2000'
      }
    })

    it('should return -1', () => {
      expect(sortTiers(thirdPartyItemTierA, thirdPartyItemTierB)).toBe(-1)
    })
  })

  describe('and the tier A has a greater value (numerically) than a tier B', () => {
    beforeEach(() => {
      thirdPartyItemTierA = {
        id: '1',
        value: '200',
        price: '1000'
      }
      thirdPartyItemTierB = {
        id: '2',
        value: '100',
        price: '2000'
      }
    })

    it('should return 1', () => {
      expect(sortTiers(thirdPartyItemTierA, thirdPartyItemTierB)).toBe(1)
    })
  })

  describe('and the tier A has the same value (numerically) than a tier B', () => {
    beforeEach(() => {
      thirdPartyItemTierA = {
        id: '1',
        value: '100',
        price: '1000'
      }
      thirdPartyItemTierB = {
        id: '2',
        value: '100',
        price: '2000'
      }
    })

    it('should return 0', () => {
      expect(sortTiers(thirdPartyItemTierA, thirdPartyItemTierB)).toBe(0)
    })
  })
})
