import { act, fireEvent, render, screen } from '@testing-library/react'
import { sleep } from 'decentraland-dapps/dist/lib/time'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import CreatorsWebsiteBanner from './CreatorsWebsiteBanner'

jest.mock('decentraland-dapps/dist/modules/analytics/utils', () => ({
  getAnalytics: jest.fn()
}))

jest.mock('decentraland-dapps/dist/lib/time', () => ({
  sleep: jest.fn()
}))

const CREATORS_WEBSITE_URL = 'https://decentraland.org/create/collections'

describe('CreatorsWebsiteBanner', () => {
  let track: jest.Mock
  let originalLocation: Location
  let link: HTMLElement

  beforeEach(() => {
    track = jest.fn()
    ;(getAnalytics as jest.Mock).mockReturnValue({ track })
    ;(sleep as jest.Mock).mockResolvedValue(undefined)
    originalLocation = window.location
    // jsdom does not navigate, so the assignment the banner makes is captured on a plain object instead.
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } })
    render(<CreatorsWebsiteBanner />)
    link = screen.getByRole('link')
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
    jest.clearAllMocks()
  })

  describe('when rendering the banner', () => {
    it('should make the whole banner a link to the creators website', () => {
      expect(link).toHaveAttribute('href', CREATORS_WEBSITE_URL)
    })
  })

  describe('when the user clicks the banner', () => {
    beforeEach(async () => {
      fireEvent.click(link)
      // Lets the delayed navigation run.
      await act(() => Promise.resolve())
    })

    it('should track the click under the location the campaign banner used', () => {
      expect(track).toHaveBeenCalledWith('CLICK_BANNER', { id: 'creators-website', location: 'builderCampaignBanner' })
    })

    it('should navigate to the creators website', () => {
      expect(window.location.href).toBe(CREATORS_WEBSITE_URL)
    })
  })

  describe('when the user clicks the banner and tracking fails', () => {
    beforeEach(async () => {
      track.mockImplementationOnce(() => {
        throw new Error('analytics unavailable')
      })
      fireEvent.click(link)
      // Lets the delayed navigation run.
      await act(() => Promise.resolve())
    })

    it('should still navigate to the creators website', () => {
      expect(window.location.href).toBe(CREATORS_WEBSITE_URL)
    })
  })

  describe('when the user clicks the banner with a modifier key', () => {
    let wasDefaultAllowed: boolean

    beforeEach(() => {
      wasDefaultAllowed = fireEvent.click(link, { metaKey: true })
    })

    it('should leave the click to the browser so it can open a new tab', () => {
      expect(wasDefaultAllowed).toBe(true)
    })

    it('should not track the click', () => {
      expect(track).not.toHaveBeenCalled()
    })
  })
})
