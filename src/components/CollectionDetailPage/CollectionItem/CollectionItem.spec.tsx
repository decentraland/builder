import { screen, waitFor } from '@testing-library/react'
import { TradeAssetType } from '@dcl/schemas'
import { TradeService } from 'decentraland-dapps/dist/modules/trades/TradeService'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { clearTradePriceDenominationCache } from 'modules/trade/denomination'
import { mockedItem } from 'specs/item'
import { renderWithProviders } from 'specs/utils'
import CollectionItem from './CollectionItem'
import { Props } from './CollectionItem.types'

jest.mock('decentraland-dapps/dist/modules/trades/TradeService')

// The editor pulls in three.js/babylon through the item preview; the price cell is what is under test.
jest.mock('components/ItemImage', () => ({
  __esModule: true,
  default: () => <div data-testid="item-image" />
}))

const TRADE_ID = 'a-trade-id'

const mockTradeWithReceivedAssetType = (assetType: TradeAssetType) => {
  const fetchTrade = jest.fn().mockResolvedValue({
    received: [{ assetType, contractAddress: '0xmana', amount: '600000000000000000', extra: '' }]
  })
  ;(TradeService as unknown as jest.Mock).mockImplementation(() => ({ fetchTrade }))
  return fetchTrade
}

const renderCollectionItem = (item: Partial<Item> = {}) => {
  const props: Props = {
    ethAddress: '0xowner',
    collection: {
      id: 'aCollectionId',
      contractAddress: '0xcollection',
      isPublished: true,
      isApproved: true,
      owner: '0xowner',
      managers: [],
      minters: [],
      createdAt: 0,
      reviewedAt: 0
    } as unknown as Collection,
    item: { ...mockedItem, isPublished: true, price: '600000000000000000', tradeId: TRADE_ID, ...item } as Item,
    status: SyncStatus.SYNCED,
    isOffchainPublicItemOrdersEnabled: true,
    isOffchainPublicItemOrdersEnabledVariants: null,
    wallet: null,
    isCancellingItemOrder: false,
    loadingTradeIds: [],
    onOpenModal: jest.fn(),
    onDeleteItem: jest.fn(),
    onSetItems: jest.fn(),
    onRemoveFromSale: jest.fn()
  }
  return renderWithProviders(<CollectionItem {...props} />)
}

describe('CollectionItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearTradePriceDenominationCache()
  })

  describe('when the item price comes from a USD-pegged trade', () => {
    it('should render the price in credits, not as MANA', async () => {
      // 0.6 USD wei = 6 credits. Read as MANA this renders "0.6".
      mockTradeWithReceivedAssetType(TradeAssetType.USD_PEGGED_MANA)
      renderCollectionItem()

      await waitFor(() => expect(screen.getByTitle(t('collection_item.credits_amount', { amount: '6' }))).toBeInTheDocument())
      expect(screen.queryByText('0.6')).not.toBeInTheDocument()
    })

    it('should round up so the shown price never sits below the charge', async () => {
      mockTradeWithReceivedAssetType(TradeAssetType.USD_PEGGED_MANA)
      renderCollectionItem({ price: '650000000000000000' })

      await waitFor(() => expect(screen.getByTitle(t('collection_item.credits_amount', { amount: '7' }))).toBeInTheDocument())
    })
  })

  describe('when the item price comes from a plain ERC20 (MANA) trade', () => {
    it('should keep rendering the price as MANA', async () => {
      const fetchTrade = mockTradeWithReceivedAssetType(TradeAssetType.ERC20)
      renderCollectionItem()

      await waitFor(() => expect(fetchTrade).toHaveBeenCalledWith(TRADE_ID))
      expect(screen.getByText('0.6')).toBeInTheDocument()
      expect(screen.queryByTitle(t('collection_item.credits_amount', { amount: '6' }))).not.toBeInTheDocument()
    })
  })

  /**
   * A credits listing lives in the SHOP — a different site from the marketplace this app publishes to. Before
   * this the row showed a plain "Published" and a creator had no way to reach the place their item was actually
   * on sale: the price was here, the destination was nowhere.
   */
  describe('when the item is on sale for credits', () => {
    it('should link the published status to the item in the shop', async () => {
      mockTradeWithReceivedAssetType(TradeAssetType.USD_PEGGED_MANA)

      renderCollectionItem({ tokenId: '3', isApproved: true })

      const link = await screen.findByRole('link', { name: /on sale in the shop/i })
      expect(link.getAttribute('href')).toContain('/shop/item/0xcollection/3')
      expect(link).toHaveAttribute('target', '_blank')
      // A creator opening the listing must not also drag the row's own navigation along.
      expect(link.getAttribute('rel')).toContain('noopener')
    })

    it('should keep the plain published status for a MANA listing', async () => {
      mockTradeWithReceivedAssetType(TradeAssetType.ERC20)

      renderCollectionItem({ tokenId: '3', isApproved: true })

      expect(await screen.findByText('0.6')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /on sale in the shop/i })).not.toBeInTheDocument()
    })

    it('should not link an item with no blockchain id yet', async () => {
      mockTradeWithReceivedAssetType(TradeAssetType.USD_PEGGED_MANA)

      renderCollectionItem({ tokenId: undefined, isApproved: true })

      // Waits for the credits price to settle FIRST, so the absence below is a real absence rather than the
      // link simply not having rendered yet — the trade read is async.
      expect(await screen.findByTitle(t('collection_item.credits_amount', { amount: '6' }))).toBeInTheDocument()
      // No blockchain id yet, so there is no shop page to point at and the status stays as it was.
      expect(screen.queryByRole('link', { name: /on sale in the shop/i })).not.toBeInTheDocument()
    })
  })
})
