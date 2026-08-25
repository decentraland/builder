import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import AnnouncementBar, { CLICK_SHOP_ANNOUNCEMENT_BAR, DISMISS_SHOP_ANNOUNCEMENT_BAR, isAnnouncementBarDismissed } from './AnnouncementBar'

jest.mock('decentraland-dapps/dist/modules/analytics/utils', () => ({
  getAnalytics: jest.fn()
}))

const ANNOUNCEMENT_BAR_KEY = 'shop-announcement-bar'
const PATH = '/scenes'

const renderComponent = (onDismiss: () => void) =>
  render(
    <MemoryRouter initialEntries={[PATH]}>
      <AnnouncementBar onDismiss={onDismiss} />
    </MemoryRouter>
  )

describe('AnnouncementBar', () => {
  let track: jest.Mock
  let onDismiss: jest.Mock

  beforeEach(() => {
    track = jest.fn()
    onDismiss = jest.fn()
    ;(getAnalytics as jest.Mock).mockReturnValue({ track })
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('when rendering the call to action', () => {
    let link: HTMLElement

    beforeEach(() => {
      renderComponent(onDismiss)
      link = screen.getByRole('link', { name: t('announcement_bar.cta') })
    })

    it('should point to the shop', () => {
      expect(link).toHaveAttribute('href', expect.stringContaining(config.get('SHOP_URL')))
    })

    /**
     * Untagged, a click from here reached the shop as anonymous traffic: the shop could not tell it apart
     * from someone arriving on their own, so the bar looked unused while the marketplace one was measurable.
     * `utm_source=builder` is what separates the two bars once the visitor is on the other side.
     */
    it('should tag the link so the shop can attribute the visit to this bar', () => {
      expect(link.getAttribute('href')).toContain('utm_source=builder&utm_medium=announcement_bar&utm_campaign=shop_launch')
    })

    it('should open the shop in a new tab so the builder context is not lost', () => {
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('when the user clicks the call to action', () => {
    beforeEach(() => {
      renderComponent(onDismiss)
      fireEvent.click(screen.getByRole('link', { name: t('announcement_bar.cta') }))
    })

    it('should track the click with the app and the page it happened on', () => {
      expect(track).toHaveBeenCalledWith(CLICK_SHOP_ANNOUNCEMENT_BAR, { source: 'builder', path: PATH })
    })
  })

  describe('when the user dismisses the bar', () => {
    beforeEach(() => {
      renderComponent(onDismiss)
      fireEvent.click(screen.getByRole('button', { name: t('announcement_bar.dismiss') }))
    })

    it('should notify the parent so it can reclaim the space', () => {
      expect(onDismiss).toHaveBeenCalled()
    })

    it('should remember the dismissal so it stays hidden on the next visit', () => {
      expect(isAnnouncementBarDismissed()).toBe(true)
    })

    it('should track the dismissal with the app and the page it happened on', () => {
      expect(track).toHaveBeenCalledWith(DISMISS_SHOP_ANNOUNCEMENT_BAR, { source: 'builder', path: PATH })
    })
  })

  describe('when it has not been dismissed', () => {
    it('should report the bar as not dismissed', () => {
      expect(isAnnouncementBarDismissed()).toBe(false)
    })
  })

  /**
   * The key is deliberately shared with the marketplace bar, which runs on the same origin in production,
   * so a dismissal in either app hides both.
   */
  describe('when it was dismissed in a previous visit', () => {
    beforeEach(() => {
      localStorage.setItem(ANNOUNCEMENT_BAR_KEY, '1')
    })

    it('should report the bar as dismissed', () => {
      expect(isAnnouncementBarDismissed()).toBe(true)
    })
  })
})
