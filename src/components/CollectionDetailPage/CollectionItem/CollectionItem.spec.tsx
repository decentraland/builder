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
})
