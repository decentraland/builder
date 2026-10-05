import { RenderResult, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TradeAssetType } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { CancelledItemOrder } from 'modules/cancelledTrades/types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { buildCancelledItemOrder } from 'specs/cancelledTrades'
import { mockedItem } from 'specs/item'
import { renderWithProviders } from 'specs/utils'
import CancelledItemOrdersNotice, { getNoticeStorageKey } from './CancelledItemOrdersNotice'
import { Props } from './CancelledItemOrdersNotice.types'

jest.mock('components/ItemImage', () => ({
  __esModule: true,
  default: () => <div data-testid="item-image" />
}))

let props: Props
let renderResult: RenderResult
let onOpenModal: jest.Mock
let item: Item

beforeEach(() => {
  onOpenModal = jest.fn()
  item = { ...mockedItem, id: 'a-builder-item-id', name: 'Builder item name', tokenId: '0' } as Item
  props = {
    collection: { id: 'a-collection-id', contractAddress: '0xcollection' } as Collection,
    items: [item],
    orders: [],
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

      it('should hide the notice and remember the dismissal for the collection', () => {
        expect(renderResult.container).toBeEmptyDOMElement()
        expect(localStorage.getItem(getNoticeStorageKey('a-collection-id'))).not.toBeNull()
      })
    })
  })
})
