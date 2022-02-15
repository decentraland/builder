import { BN } from 'bn.js'
import { ThirdParty } from './types'
import { getAvailableSlots } from './utils'

describe('when getting the available slots of a third party', () => {
  let thirdParty: ThirdParty

  describe('when the max items are greater (100) than the total items (50)', () => {
    beforeEach(() => {
      thirdParty = {
        id: '1',
        name: 'a third party',
        description: 'some desc',
        maxItems: '100',
        totalItems: '50',
        managers: ['0xa']
      }
    })

    it('should return the subtraction of max items with total items (50)', () => {
      expect(getAvailableSlots(thirdParty)).toEqual(new BN(50))
    })
  })

  describe('when the max items are equal (100) than the total items (100)', () => {
    beforeEach(() => {
      thirdParty = {
        id: '1',
        name: 'a third party',
        description: 'some desc',
        maxItems: '100',
        totalItems: '100',
        managers: ['0xa']
      }
    })

    it('should return the subtraction of max items with total items (0)', () => {
      expect(getAvailableSlots(thirdParty)).toEqual(new BN(0))
    })
  })

  describe('when the max items are lower (50) than the total items (100)', () => {
    beforeEach(() => {
      thirdParty = {
        id: '1',
        name: 'a third party',
        description: 'some desc',
        maxItems: '50',
        totalItems: '100',
        managers: ['0xa']
      }
    })

    it('should return the subtraction of max items with total items (-50)', () => {
      expect(getAvailableSlots(thirdParty)).toEqual(new BN(-50))
    })
  })
})
