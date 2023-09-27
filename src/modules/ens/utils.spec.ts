import { isExternalName } from './utils'

describe('when checking if a subdomain is an external subdomain', () => {
  let subdomain: string

  describe('when providing a dcl subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.dcl.eth'
    })

    it('should return false', () => {
      expect(isExternalName(subdomain)).toBe(false)
    })
  })

  describe('when providing a non dcl subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.eth'
    })

    it('should return true', () => {
      expect(isExternalName(subdomain)).toBe(true)
    })
  })
})
