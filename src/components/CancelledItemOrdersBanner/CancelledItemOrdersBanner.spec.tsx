import { RenderResult, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { CancelledItemOrdersGroup } from 'modules/cancelledTrades/selectors'
import { renderWithProviders } from 'specs/utils'
import CancelledItemOrdersBanner, { getBannerStorageKey } from './CancelledItemOrdersBanner'

const ADDRESS = '0xAddress'

let groups: CancelledItemOrdersGroup[]
let renderResult: RenderResult

afterEach(() => {
  localStorage.clear()
})

describe('when rendering the cancelled item orders banner', () => {
  describe('and there are no cancelled item orders', () => {
    beforeEach(() => {
      groups = []
      renderResult = renderWithProviders(<CancelledItemOrdersBanner address={ADDRESS} groups={groups} />)
    })

    it('should render nothing', () => {
      expect(renderResult.container).toBeEmptyDOMElement()
    })
  })

  describe('and there are cancelled item orders', () => {
    beforeEach(() => {
      groups = [
        { contractAddress: '0xcollection', collection: { id: 'a-collection-id', name: 'A collection' }, count: 2 },
        { contractAddress: '0xunknown', collection: null, count: 1 }
      ]
    })

    describe('and the banner was not dismissed', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersBanner address={ADDRESS} groups={groups} />)
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
    })

    describe('and the close button is clicked', () => {
      beforeEach(() => {
        renderResult = renderWithProviders(<CancelledItemOrdersBanner address={ADDRESS} groups={groups} />)
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
        renderResult = renderWithProviders(<CancelledItemOrdersBanner address={ADDRESS} groups={groups} />)
      })

      it('should render nothing', () => {
        expect(renderResult.container).toBeEmptyDOMElement()
      })
    })
  })
})
