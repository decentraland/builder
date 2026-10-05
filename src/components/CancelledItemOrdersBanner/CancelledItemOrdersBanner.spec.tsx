import { RenderResult, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { renderWithProviders } from 'specs/utils'
import CancelledItemOrdersBanner, { getBannerStorageKey } from './CancelledItemOrdersBanner'
import { Props } from './CancelledItemOrdersBanner.types'

const ADDRESS = '0xAddress'

let props: Props
let renderResult: RenderResult

beforeEach(() => {
  props = { address: ADDRESS, groups: [], isIncomplete: false }
})

afterEach(() => {
  localStorage.clear()
})

describe('when rendering the cancelled item orders banner', () => {
  describe('and there are no cancelled item orders', () => {
    beforeEach(() => {
      renderResult = renderWithProviders(<CancelledItemOrdersBanner {...props} />)
    })

    it('should render nothing', () => {
      expect(renderResult.container).toBeEmptyDOMElement()
    })
  })

  describe('and there are cancelled item orders', () => {
    beforeEach(() => {
      props = {
        ...props,
        groups: [
          { contractAddress: '0xcollection', collection: { id: 'a-collection-id', name: 'A collection' }, count: 2 },
          { contractAddress: '0xunknown', collection: null, count: 1 }
        ]
      }
    })

    describe('and the banner was not dismissed', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersBanner {...props} />)
      })

      it('should render the total of cancelled listings', () => {
        expect(screen.getByText('3 of your item listings were cancelled')).toBeInTheDocument()
      })

      it('should link the known collections to their detail page', () => {
        expect(screen.getByRole('link', { name: t('cancelled_item_orders.banner.review') })).toHaveAttribute(
          'href',
          '/collections/a-collection-id'
        )
      })

      it('should list the collections that could not be resolved without a link', () => {
        expect(screen.getByText(t('cancelled_item_orders.banner.unknown_collection'))).toBeInTheDocument()
      })

      it('should not offer to show more collections', () => {
        expect(screen.queryByRole('button', { expanded: false })).not.toBeInTheDocument()
      })

      it('should not warn that the list may be incomplete', () => {
        expect(screen.queryByText(t('cancelled_item_orders.banner.incomplete'))).not.toBeInTheDocument()
      })
    })

    describe('and some of them could not be loaded', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersBanner {...props} isIncomplete />)
      })

      it('should warn that the list may be incomplete', () => {
        expect(screen.getByText(t('cancelled_item_orders.banner.incomplete'))).toBeInTheDocument()
      })
    })

    describe('and the close button is clicked', () => {
      beforeEach(() => {
        renderResult = renderWithProviders(<CancelledItemOrdersBanner {...props} />)
        act(() => userEvent.click(screen.getByRole('button', { name: t('global.close') })))
      })

      it('should hide the banner', () => {
        expect(renderResult.container).toBeEmptyDOMElement()
      })

      it('should remember the dismissal for the address', () => {
        expect(localStorage.getItem(getBannerStorageKey(ADDRESS))).not.toBeNull()
      })
    })

    describe('and the banner was dismissed before', () => {
      beforeEach(() => {
        localStorage.setItem(getBannerStorageKey(ADDRESS), '1')
        renderResult = renderWithProviders(<CancelledItemOrdersBanner {...props} />)
      })

      it('should render nothing', () => {
        expect(renderResult.container).toBeEmptyDOMElement()
      })
    })
  })

  describe('and the cancelled item orders span many collections', () => {
    beforeEach(() => {
      props = {
        ...props,
        groups: Array.from({ length: 8 }, (_, index) => ({
          contractAddress: `0xcollection${index}`,
          collection: { id: `collection-${index}`, name: `Collection ${index}` },
          count: 100 - index
        }))
      }
    })

    describe('and the list was not expanded', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersBanner {...props} />)
      })

      it('should render the total of cancelled listings across every collection', () => {
        expect(screen.getByText('772 of your item listings were cancelled')).toBeInTheDocument()
      })

      it('should list only the first five collections', () => {
        expect(screen.getAllByRole('link', { name: t('cancelled_item_orders.banner.review') })).toHaveLength(5)
      })

      it('should offer to show the remaining collections', () => {
        expect(screen.getByRole('button', { name: 'Show 3 more collections' })).toHaveAttribute('aria-expanded', 'false')
      })
    })

    describe('and the show more button is clicked', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersBanner {...props} />)
        act(() => userEvent.click(screen.getByRole('button', { name: 'Show 3 more collections' })))
      })

      it('should list every collection', () => {
        expect(screen.getAllByRole('link', { name: t('cancelled_item_orders.banner.review') })).toHaveLength(8)
      })

      it('should offer to show fewer collections', () => {
        expect(screen.getByRole('button', { name: t('cancelled_item_orders.banner.show_less') })).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })
})
