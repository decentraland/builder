import { RenderResult, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TradeAssetType } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { CancelledItemOrder } from 'modules/cancelledItemOrders/types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { buildCancelledItemOrder } from 'specs/cancelledItemOrders'
import { mockedItem } from 'specs/item'
import { renderWithProviders } from 'specs/utils'
import CancelledItemOrdersNotice, { getNoticeStorageKey } from './CancelledItemOrdersNotice'
import { Props } from './CancelledItemOrdersNotice.types'

jest.mock('components/ItemImage', () => ({
  __esModule: true,
  default: () => <div data-testid="item-image" />
}))

const ADDRESS = '0xAddress'

let props: Props
let renderResult: RenderResult
let onOpenModal: jest.Mock
let item: Item

beforeEach(() => {
  onOpenModal = jest.fn()
  item = { ...mockedItem, id: 'a-builder-item-id', name: 'Builder item name', tokenId: '0' } as Item
  props = {
    address: ADDRESS,
    collection: { id: 'a-collection-id', contractAddress: '0xcollection' } as Collection,
    items: [item],
    orders: [],
    isIncomplete: false,
    onOpenModal
  }
})

afterEach(() => {
  localStorage.clear()
  jest.resetAllMocks()
})

describe('when rendering the cancelled item orders notice', () => {
  describe('and the collection has no cancelled item orders', () => {
    beforeEach(() => {
      renderResult = renderWithProviders(<CancelledItemOrdersNotice {...props} />)
    })

    it('should render nothing', () => {
      expect(renderResult.container).toBeEmptyDOMElement()
    })
  })

  describe('and the collection has cancelled item orders', () => {
    let matchedOrder: CancelledItemOrder
    let unmatchedOrder: CancelledItemOrder

    beforeEach(() => {
      matchedOrder = buildCancelledItemOrder()
      unmatchedOrder = buildCancelledItemOrder({
        id: 'unmatched',
        asset: { ...matchedOrder.asset, itemId: '9', name: 'Removed item' },
        price: { assetType: TradeAssetType.USD_PEGGED_MANA, amount: '500000000000000000' }
      })
      props = { ...props, orders: [matchedOrder, unmatchedOrder] }
    })

    describe('and the notice was not dismissed', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersNotice {...props} />)
      })

      it('should render the count of cancelled listings in the collection', () => {
        expect(screen.getByText('2 listings in this collection were cancelled')).toBeInTheDocument()
      })

      it('should name the matched item after the builder item', () => {
        expect(screen.getByText('Builder item name')).toBeInTheDocument()
      })

      it('should render the previous USD-pegged price in credits', () => {
        expect(screen.getByText('5 credits')).toBeInTheDocument()
      })

      it('should offer to put only the matched item for sale again', () => {
        expect(screen.getAllByRole('button', { name: t('cancelled_item_orders.notice.put_for_sale_again') })).toHaveLength(1)
      })
    })

    describe('and the put for sale again button is clicked', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersNotice {...props} />)
        act(() => userEvent.click(screen.getByRole('button', { name: t('cancelled_item_orders.notice.put_for_sale_again') })))
      })

      it('should open the put for sale modal for the builder item', () => {
        expect(onOpenModal).toHaveBeenCalledWith('PutForSaleOffchainModal', { itemId: 'a-builder-item-id' })
      })
    })

    describe('and the close button is clicked', () => {
      beforeEach(() => {
        renderResult = renderWithProviders(<CancelledItemOrdersNotice {...props} />)
        act(() => userEvent.click(screen.getByRole('button', { name: t('global.close') })))
      })

      it('should hide the notice', () => {
        expect(renderResult.container).toBeEmptyDOMElement()
      })

      it('should remember the dismissal for the address and the collection', () => {
        expect(localStorage.getItem(getNoticeStorageKey(ADDRESS, 'a-collection-id'))).not.toBeNull()
      })
    })

    describe('and the notice was dismissed by another address', () => {
      beforeEach(() => {
        localStorage.setItem(getNoticeStorageKey('0xanother', 'a-collection-id'), '1')
        renderWithProviders(<CancelledItemOrdersNotice {...props} />)
      })

      it('should render the notice', () => {
        expect(screen.getByText('2 listings in this collection were cancelled')).toBeInTheDocument()
      })
    })
  })

  describe('and the collection has many cancelled item orders', () => {
    let items: Item[]

    beforeEach(() => {
      // 200 orders, only the last 100 of them matching a builder item
      items = Array.from({ length: 100 }, (_, index) => ({ ...item, id: `builder-item-${index}`, tokenId: `${100 + index}` } as Item))
      props = {
        ...props,
        items,
        orders: Array.from({ length: 200 }, (_, index) =>
          buildCancelledItemOrder({ id: `trade-${index}`, asset: { ...buildCancelledItemOrder().asset, itemId: `${index}` } })
        )
      }
    })

    describe('and the list was not expanded', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersNotice {...props} />)
      })

      it('should render the count of every cancelled listing in the collection', () => {
        expect(screen.getByText('200 listings in this collection were cancelled')).toBeInTheDocument()
      })

      it('should list only the first five listings, starting with the ones that can be put for sale again', () => {
        expect(screen.getAllByRole('button', { name: t('cancelled_item_orders.notice.put_for_sale_again') })).toHaveLength(5)
      })

      it('should offer to show the remaining listings', () => {
        expect(screen.getByRole('button', { name: 'Show 195 more listings' })).toHaveAttribute('aria-expanded', 'false')
      })
    })

    describe('and the show more button is clicked', () => {
      beforeEach(() => {
        renderWithProviders(<CancelledItemOrdersNotice {...props} />)
        act(() => userEvent.click(screen.getByRole('button', { name: 'Show 195 more listings' })))
      })

      it('should list every cancelled listing', () => {
        expect(screen.getAllByRole('listitem')).toHaveLength(200)
      })

      it('should offer to put every matched item for sale again', () => {
        expect(screen.getAllByRole('button', { name: t('cancelled_item_orders.notice.put_for_sale_again') })).toHaveLength(100)
      })
    })
  })

  describe('and some cancelled item orders could not be loaded', () => {
    beforeEach(() => {
      props = { ...props, orders: [buildCancelledItemOrder()], isIncomplete: true }
      renderWithProviders(<CancelledItemOrdersNotice {...props} />)
    })

    it('should warn that the list may be incomplete', () => {
      expect(screen.getByText(t('cancelled_item_orders.banner.incomplete'))).toBeInTheDocument()
    })
  })
})
