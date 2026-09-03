import { SEGMENT_KILL_SWITCH_KEY, getAnalyticsProxyOptions, persistSegmentKillSwitch } from './proxy'

const analyticsUrl = 'https://evs.example.com/bundle.min.js'
const apiHost = 'api.example.com/v1'
const proxyOptions = { analyticsUrl, apiHost }

beforeEach(() => {
  localStorage.clear()
})

describe('when getting the analytics proxy options', () => {
  describe('and the kill switch was persisted as enabled', () => {
    beforeEach(() => {
      localStorage.setItem(SEGMENT_KILL_SWITCH_KEY, '1')
    })

    it('should return no options so the events go straight to Segment', () => {
      expect(getAnalyticsProxyOptions(analyticsUrl, apiHost)).toBeUndefined()
    })
  })

  describe('and the kill switch was persisted as disabled', () => {
    beforeEach(() => {
      localStorage.setItem(SEGMENT_KILL_SWITCH_KEY, '0')
    })

    it('should return the configured proxy options', () => {
      expect(getAnalyticsProxyOptions(analyticsUrl, apiHost)).toEqual(proxyOptions)
    })
  })

  describe('and nothing was persisted', () => {
    it('should return the configured proxy options', () => {
      expect(getAnalyticsProxyOptions(analyticsUrl, apiHost)).toEqual(proxyOptions)
    })
  })

  describe('and a value other than the persisted ones is stored', () => {
    beforeEach(() => {
      localStorage.setItem(SEGMENT_KILL_SWITCH_KEY, 'true')
    })

    it('should return the configured proxy options', () => {
      expect(getAnalyticsProxyOptions(analyticsUrl, apiHost)).toEqual(proxyOptions)
    })
  })

  describe('and the proxy is not configured', () => {
    it('should return no options', () => {
      expect(getAnalyticsProxyOptions()).toBeUndefined()
      expect(getAnalyticsProxyOptions('', '')).toBeUndefined()
    })
  })

  describe('and only one of the proxy values is configured', () => {
    it('should return the configured one', () => {
      expect(getAnalyticsProxyOptions(analyticsUrl)).toEqual({ analyticsUrl })
      expect(getAnalyticsProxyOptions(undefined, apiHost)).toEqual({ apiHost })
    })
  })

  describe('and reading the persisted value throws', () => {
    let getItem: jest.SpyInstance

    beforeEach(() => {
      getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage is not available')
      })
    })

    afterEach(() => {
      getItem.mockRestore()
    })

    it('should return the configured proxy options instead of dropping the tracking', () => {
      expect(getAnalyticsProxyOptions(analyticsUrl, apiHost)).toEqual(proxyOptions)
    })
  })
})

describe('when persisting the kill switch value', () => {
  describe('and the kill switch is enabled', () => {
    it('should round trip to no proxy options', () => {
      persistSegmentKillSwitch(true)

      expect(localStorage.getItem(SEGMENT_KILL_SWITCH_KEY)).toBe('1')
      expect(getAnalyticsProxyOptions(analyticsUrl, apiHost)).toBeUndefined()
    })
  })

  describe('and the kill switch is disabled', () => {
    beforeEach(() => {
      localStorage.setItem(SEGMENT_KILL_SWITCH_KEY, '1')
    })

    it('should round trip to the configured proxy options', () => {
      persistSegmentKillSwitch(false)

      expect(localStorage.getItem(SEGMENT_KILL_SWITCH_KEY)).toBe('0')
      expect(getAnalyticsProxyOptions(analyticsUrl, apiHost)).toEqual(proxyOptions)
    })
  })

  describe('and writing the value throws', () => {
    let setItem: jest.SpyInstance

    beforeEach(() => {
      setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage is not available')
      })
    })

    afterEach(() => {
      setItem.mockRestore()
    })

    it('should not throw', () => {
      expect(() => persistSegmentKillSwitch(true)).not.toThrow()
    })
  })
})
