import { LandType, Rental } from './types'
import { hasRentalPeriodEnded } from './utils'

describe('when checking if the rental period has ended', () => {
  let rental: Rental

  beforeEach(() => {
    rental = {
      id: 'aRentalId',
      type: LandType.PARCEL,
      tokenId: 'aTokenId',
      lessor: 'anAddress',
      tenant: 'aTentant',
      operator: 'anotherAddress',
      startedAt: new Date(),
      endsAt: new Date()
    }
  })

  describe('and the end date of the rental has passed the current date', () => {
    beforeEach(() => {
      rental.endsAt = new Date(Date.now() - 100000000000)
    })

    it('should return true', () => {
      expect(hasRentalPeriodEnded(rental)).toBe(true)
    })
  })

  describe('and the end date of the rental is the same as current date', () => {
    beforeEach(() => {
      const currentDate = Date.now()
      jest.spyOn(Date, 'now').mockReturnValueOnce(currentDate)
      rental.endsAt = new Date(currentDate)
    })

    it('should return false', () => {
      expect(hasRentalPeriodEnded(rental)).toBe(false)
    })
  })

  describe('and the end date of the rental has not passed the current date', () => {
    beforeEach(() => {
      rental.endsAt = new Date(Date.now() + 100000000000)
    })

    it('should return false', () => {
      expect(hasRentalPeriodEnded(rental)).toBe(false)
    })
  })
})
