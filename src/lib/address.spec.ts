import { isAddressBeingWritten } from './address'

describe('when checking if an address is being written', () => {
  let address: string

  beforeEach(() => {
    address = '0x'
  })

  describe('and the given address has a lower length than the correct one', () => {
    beforeEach(() => {
      address = address + 'ae34'
    })

    it('should return true', () => {
      expect(isAddressBeingWritten(address)).toBe(true)
    })
  })

  describe('and the given address has a higher length than the correct one', () => {
    beforeEach(() => {
      address = address + 'ae34dea75982734959342342348578956548694648923489238234892348923489'
    })

    it('should return false', () => {
      expect(isAddressBeingWritten(address)).toBe(false)
    })
  })

  describe("and the given address has characters that don't belong to an address", () => {
    beforeEach(() => {
      address = address + 'kjl3234234'
    })

    it('should return false', () => {
      expect(isAddressBeingWritten(address)).toBe(false)
    })
  })
})
