import { getCroppedAddress } from './utils'

describe('getCroppedAddress', () => {
  describe('when address is a 42 character string', () => {
    it('should return only the first 5 and last 6 characters of address', () => {
      expect(getCroppedAddress('0xA4f689625F6F51AdF691988D38772BE8509087d2')).toEqual('0xA4f...9087d2')
    })
  })

  describe('when address is undefined', () => {
    it('should return empty string', () => {
      expect(getCroppedAddress(undefined)).toEqual('')
    })
  })

  describe('when address is not a 42 character string', () => {
    it('should return empty string', () => {
      expect(getCroppedAddress('0xA4f689625F6F51AdF691988D38772')).toEqual('')
    })
  })
})
