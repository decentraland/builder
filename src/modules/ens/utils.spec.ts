import { isExternalName } from './utils'

describe('when checking if a subdomain is an external subdomain', () => {
  describe('when providing a dcl subdomain', () => {
    it('should return false', () => {
      expect(isExternalName('name.dcl.eth')).toBe(false)
    })
  })

  describe('when providing a non dcl subdomain', () => {
    it('should return true', () => {
      expect(isExternalName('name.eth')).toBe(true)
    })
  })
})
