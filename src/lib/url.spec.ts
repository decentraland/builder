import { getSafeExternalUrl, openExternal } from './url'

describe('when getting the safe external url', () => {
  describe('and the url is a valid https url', () => {
    it('should return the url', () => {
      expect(getSafeExternalUrl('https://forum.decentraland.org/t/a-post/1')).toBe('https://forum.decentraland.org/t/a-post/1')
    })
  })

  describe('and the url uses the http protocol', () => {
    it('should return undefined', () => {
      expect(getSafeExternalUrl('http://forum.decentraland.org/t/a-post/1')).toBeUndefined()
    })
  })

  describe('and the url uses the data protocol', () => {
    it('should return undefined', () => {
      expect(getSafeExternalUrl('data:text/html,hello')).toBeUndefined()
    })
  })

  describe('and the url uses the javascript protocol', () => {
    it('should return undefined', () => {
      expect(getSafeExternalUrl('javascript:void 0')).toBeUndefined()
    })
  })

  describe('and the url disguises the javascript protocol with casing or leading whitespace', () => {
    it.each(['JavaScript:alert(1)', 'jaVAScript:alert(1)', ' javascript:alert(1)'])('should return undefined for %j', value => {
      expect(getSafeExternalUrl(value)).toBeUndefined()
    })
  })

  describe('and the url embeds credentials', () => {
    it('should return undefined', () => {
      expect(getSafeExternalUrl('https://user:pass@forum.decentraland.org')).toBeUndefined()
    })
  })

  describe('and the url is malformed', () => {
    it('should return undefined', () => {
      expect(getSafeExternalUrl('not a url')).toBeUndefined()
    })
  })

  describe('and the url is empty, undefined or null', () => {
    it('should return undefined', () => {
      expect(getSafeExternalUrl('')).toBeUndefined()
      expect(getSafeExternalUrl(undefined)).toBeUndefined()
      expect(getSafeExternalUrl(null)).toBeUndefined()
    })
  })
})

describe('when opening an external url', () => {
  let openSpy: jest.SpyInstance

  beforeEach(() => {
    openSpy = jest.spyOn(window, 'open').mockReturnValue(null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  describe('and the url is a safe external url', () => {
    it('should open it in a new tab without sharing the current context', () => {
      openExternal('https://forum.decentraland.org/t/a-post/1')
      expect(openSpy).toHaveBeenCalledWith('https://forum.decentraland.org/t/a-post/1', '_blank', 'noopener,noreferrer')
    })
  })

  describe('and the url is not a safe external url', () => {
    it('should not open anything', () => {
      openExternal('javascript:void 0')
      openExternal('http://forum.decentraland.org')
      openExternal(undefined)
      expect(openSpy).not.toHaveBeenCalled()
    })
  })
})
