import { Land, LandTile, LandType, Rental, RoleType } from './types'
import { hasRentalPeriodEnded, locateNextLand } from './utils'

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

describe('when locating the next land', () => {
  let landTiles: Record<string, LandTile>
  let firstLand: Land
  let secondLand: Land

  function buildLand(id: string): Land {
    return {
      id,
      tokenId: id,
      type: LandType.PARCEL,
      roles: [RoleType.OWNER],
      role: RoleType.OWNER,
      name: id,
      description: null,
      owner: '0xanOwner',
      operators: []
    }
  }

  beforeEach(() => {
    firstLand = buildLand('0,0')
    secondLand = buildLand('1,0')
    landTiles = {
      '0,0': { color: '', land: firstLand },
      '1,0': { color: '', land: secondLand }
    }
  })

  describe('and there are no land tiles', () => {
    it('should return undefined', () => {
      expect(locateNextLand({}, '0,0')).toBeUndefined()
    })
  })

  describe('and there is no current land', () => {
    it('should return the first land', () => {
      expect(locateNextLand(landTiles)).toBe(firstLand)
    })
  })

  describe('and the current land is not in the tiles', () => {
    it('should return the first land', () => {
      expect(locateNextLand(landTiles, '5,5')).toBe(firstLand)
    })
  })

  describe('and the current land is not the last one', () => {
    it('should return the land that follows it', () => {
      expect(locateNextLand(landTiles, '0,0')).toBe(secondLand)
    })
  })

  describe('and the current land is the last one', () => {
    it('should wrap around to the first land', () => {
      expect(locateNextLand(landTiles, '1,0')).toBe(firstLand)
    })
  })
})
