import { RootState } from 'modules/common/types'
import { getRentalForLand } from './selectors'
import { Land, LandType, Rental } from './types'

describe('Land selectors', () => {
  let parcel: Land
  let estate: Land
  let parcelRental: Rental
  let estateRental: Rental
  let state: RootState

  beforeEach(() => {
    parcel = { id: 'anId', type: LandType.PARCEL, tokenId: 'landTokenId' } as Land
    estate = { id: 'anId', type: LandType.ESTATE } as Land
    parcelRental = { id: 'aRentalId', type: LandType.PARCEL, tokenId: parcel.tokenId } as Rental
    estateRental = { id: 'aRentalId', type: LandType.ESTATE, tokenId: estate.id } as Rental
    state = {
      land: {
        data: {
          [parcel.id]: parcel,
          [estate.id]: estate
        },
        rentals: [parcelRental, estateRental]
      }
    } as any
  })

  describe('when getting the rental for a land', () => {
    it('should return the list of items available in the state', () => {
      expect(getRentalForLand(state, parcel)).toEqual(parcelRental)
    })
  })
})
