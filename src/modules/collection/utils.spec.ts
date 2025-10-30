import { ChainId, BodyShape } from '@dcl/schemas'
import * as dappsEth from 'decentraland-dapps/dist/lib/eth'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { buildCatalystItemURN, buildThirdPartyURN } from 'lib/urn'
import { Item } from 'modules/item/types'
import { Collection, CollectionType } from 'modules/collection/types'
import { Mint } from './types'
import {
  getTotalAmountOfMintedItems,
  isLocked,
  getCollectionType,
  isTPCollection,
  getTPThresholdToReview,
  toPaginationStats,
  getFiatGatewayCommodityAmount,
  getOffchainSaleAddress,
  isEnableForSaleOffchain,
  enableSaleOffchain,
  getOffchainV2SaleAddress
} from './utils'
import { MAX_TP_ITEMS_TO_REVIEW, MIN_TP_ITEMS_TO_REVIEW, TP_TRESHOLD_TO_REVIEW } from './constants'
import { CollectionPaginationData } from './reducer'

jest.mock('modules/item/export')

jest.mock('decentraland-dapps/dist/lib/eth', () => {
  const original = jest.requireActual<typeof dappsEth>('decentraland-dapps/dist/lib/eth')
  return {
    ...original,
    getChainIdByNetwork: jest.fn()
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('when counting the amount of minted items', () => {
  let mints: Mint[]
  let item: Item

  beforeEach(() => {
    item = { id: 'anId' } as Item
  })

  describe('having no mints', () => {
    beforeEach(() => {
      mints = []
    })

    it('should return 0', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(0)
    })
  })

  describe('having one mint of amount 3', () => {
    beforeEach(() => {
      mints = [{ address: 'anAddress', amount: 3, item }]
    })

    it('should return 3', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(3)
    })
  })

  describe('having two mints of amount 2', () => {
    beforeEach(() => {
      mints = [
        { address: 'anAddress', amount: 2, item },
        { address: 'anotherAddress', amount: 2, item }
      ]
    })
    it('should return 4', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(4)
    })
  })
})

describe('when checking collection locks', () => {
  let collection: Collection

  describe('when the collection does not have a lock', () => {
    beforeEach(() => {
      collection = { lock: undefined, isPublished: false } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection is published', () => {
    beforeEach(() => {
      collection = { lock: undefined, isPublished: false } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection has an expired lock and is published', () => {
    beforeEach(() => {
      const lock = Date.now() - 3 * 60 * 60 * 1000 // 3 days in milliseconds
      collection = { lock, isPublished: true } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection has a valid lock and is not published', () => {
    beforeEach(() => {
      const lock = Date.now() - 2 * 60 * 1000 // 2 minutes in milliseconds
      collection = { lock, isPublished: false } as Collection
    })
    it('should return true', () => {
      expect(isLocked(collection)).toBe(true)
    })
  })
})

describe('when getting the collection type', () => {
  let collection: Collection

  describe('when the collection has a base avatar URN', () => {
    beforeEach(() => {
      collection = { id: 'aCollection', urn: BodyShape.FEMALE.toString() } as Collection
    })

    it('should return a standard collection type', () => {
      expect(getCollectionType(collection)).toBe(CollectionType.STANDARD)
    })
  })

  describe('when the collection has a collections v2 URN', () => {
    beforeEach(() => {
      jest.spyOn(dappsEth, 'getChainIdByNetwork').mockReturnValueOnce(ChainId.MATIC_MAINNET)
      collection = { id: 'aCollection', urn: buildCatalystItemURN('0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8', '22') } as Collection
    })

    it('should return a standard collection type', () => {
      expect(getCollectionType(collection)).toBe(CollectionType.STANDARD)
    })
  })

  describe('when the collection has a third party URN', () => {
    beforeEach(() => {
      jest.spyOn(dappsEth, 'getChainIdByNetwork').mockReturnValueOnce(ChainId.MATIC_MAINNET)
      collection = { id: 'aCollection', urn: buildThirdPartyURN('thirdpartyname', 'collection-id', '22') } as Collection
    })

    it('should return a third party collection type', () => {
      expect(getCollectionType(collection)).toBe(CollectionType.THIRD_PARTY)
    })
  })
})

describe('when checking if a collection is of type third party', () => {
  let collection: Collection

  describe('and the collection is not a third party collection', () => {
    beforeEach(() => {
      collection = {
        id: 'aCollection',
        urn: 'urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
      } as Collection
    })

    it('should return false', () => {
      expect(isTPCollection(collection)).toBe(false)
    })
  })

  describe('and the collection is a third party collection', () => {
    beforeEach(() => {
      collection = {
        id: 'aCollection',
        urn: 'urn:decentraland:matic:collections-thirdparty:some-tp-name:the-collection-id:a-wonderful-token-id'
      } as Collection
    })

    it('should return true', () => {
      expect(isTPCollection(collection)).toBe(true)
    })
  })
})

describe('when getting the threshold of items to review for a TP collection', () => {
  let totalItems: number
  describe('and the collection has less than the minimum items to review', () => {
    beforeEach(() => {
      totalItems = MIN_TP_ITEMS_TO_REVIEW - 10
    })
    it('should return the total amount of items', () => {
      expect(getTPThresholdToReview(totalItems)).toBe(totalItems)
    })
  })
  describe('and the collection has more than the minium to review', () => {
    beforeEach(() => {
      totalItems = MIN_TP_ITEMS_TO_REVIEW + 10
    })
    it('should return the minimum quantity to review', () => {
      expect(getTPThresholdToReview(totalItems)).toBe(MIN_TP_ITEMS_TO_REVIEW)
    })
  })
  describe('and the collection has an amount of items somewhere in between of the minimum amount of items and the minimum percentage', () => {
    beforeEach(() => {
      totalItems = 500
    })
    it('should return the minimum quantity to review', () => {
      expect(getTPThresholdToReview(totalItems)).toBe(50)
    })
  })
  describe('and the collection has an amount of items somewhere in between the 1% and the max percentage', () => {
    beforeEach(() => {
      totalItems = 10001
    })
    it('should return the minimum quantity to review', () => {
      expect(getTPThresholdToReview(totalItems)).toBe(Math.ceil(totalItems * TP_TRESHOLD_TO_REVIEW))
    })
  })
  describe('and the collection has more than the maxium to review', () => {
    beforeEach(() => {
      totalItems = 35000 // the 1% es greater than the max value to review
    })
    it('should return the minum percentage to review of the collection', () => {
      expect(getTPThresholdToReview(totalItems)).toBe(MAX_TP_ITEMS_TO_REVIEW)
    })
  })
})

describe('when transforming a CollectionPaginationData to PaginationStats', () => {
  const collectionPaginationData: CollectionPaginationData = {
    currentPage: 1,
    ids: ['1', '2', '3'],
    limit: 10,
    total: 1,
    totalPages: 1
  }
  it('should return a PaginationStats instance with the right data', () => {
    expect(toPaginationStats(collectionPaginationData)).toStrictEqual({
      limit: collectionPaginationData.limit,
      total: collectionPaginationData.total,
      pages: collectionPaginationData.totalPages,
      page: collectionPaginationData.currentPage
    })
  })
})

describe('when getting the fiat commodity amount', () => {
  let unitPrice: string
  let items: number

  describe('when the amount of items is 1', () => {
    beforeEach(() => {
      items = 1
    })

    describe('when the unit price is not a string of a number', () => {
      beforeEach(() => {
        unitPrice = 'not-a-number'
      })

      it('should fail', () => {
        expect(() => getFiatGatewayCommodityAmount(unitPrice, items)).toThrow(
          'invalid BigNumber string (argument="value", value="not-a-number", code=INVALID_ARGUMENT, version=bignumber/5.7.0)'
        )
      })
    })

    describe('when the unit price is 1 wei', () => {
      beforeEach(() => {
        unitPrice = '1'
      })

      it('should return 0.00000001', () => {
        expect(getFiatGatewayCommodityAmount(unitPrice, items)).toBe(0.00000001)
      })
    })

    describe('when the unit price is 10000000000 wei', () => {
      beforeEach(() => {
        unitPrice = '10000000000'
      })

      it('should return 0.00000002', () => {
        expect(getFiatGatewayCommodityAmount(unitPrice, items)).toBe(0.00000002)
      })
    })

    describe('when the unit price is 0.123456789 eth', () => {
      beforeEach(() => {
        unitPrice = '123456789000000000'
      })

      it('should return 0.12407408', () => {
        expect(getFiatGatewayCommodityAmount(unitPrice, items)).toBe(0.12407408)
      })
    })

    describe('when the unit price is 1 eth', () => {
      beforeEach(() => {
        unitPrice = '1000000000000000000'
      })

      it('should return 1', () => {
        expect(getFiatGatewayCommodityAmount(unitPrice, items)).toBe(1.005)
      })
    })
  })

  describe('when the amount of items is 10', () => {
    beforeEach(() => {
      items = 10
    })

    describe('when the unit price is 1 eth', () => {
      beforeEach(() => {
        unitPrice = '1000000000000000000'
      })

      it('should return 10', () => {
        expect(getFiatGatewayCommodityAmount(unitPrice, items)).toBe(10.05)
      })
    })
  })
})

describe('when getting if a collection is enable for offchain purchases', () => {
  describe('when the offchain contract is a minter of the collection', () => {
    it('should return true', () => {
      const offchainContract = getOffchainSaleAddress(ChainId.MATIC_AMOY)
      expect(
        isEnableForSaleOffchain(
          { minters: [offchainContract], id: '1' } as Collection,
          { networks: { MATIC: { chainId: ChainId.MATIC_AMOY } } } as Wallet
        )
      ).toBe(true)
    })
  })

  describe('when the offchain contract is not a minter of the collection', () => {
    it('should return true', () => {
      expect(
        isEnableForSaleOffchain(
          { minters: [], id: '1' } as unknown as Collection,
          { networks: { MATIC: { chainId: ChainId.MATIC_AMOY } } } as Wallet
        )
      ).toBe(false)
    })
  })
})

describe('when toggling the permissions for the offchain marketplace contract', () => {
  describe('and the user wants to enable the contract', () => {
    it('should return the correct set of permissions', () => {
      const address = getOffchainV2SaleAddress(ChainId.MATIC_AMOY)
      const collection = { id: 'id' } as Collection
      expect(enableSaleOffchain(collection, { networks: { MATIC: { chainId: ChainId.MATIC_AMOY } } } as Wallet, true)).toEqual([
        { address, hasAccess: true, collection }
      ])
    })
  })

  describe('and the user wants to disable the contract', () => {
    it('should return the correct set of permissions', () => {
      const address = getOffchainV2SaleAddress(ChainId.MATIC_AMOY)
      const collection = { id: 'id', minters: [address] } as Collection
      expect(enableSaleOffchain(collection, { networks: { MATIC: { chainId: ChainId.MATIC_AMOY } } } as Wallet, false)).toEqual([
        { address, hasAccess: false, collection }
      ])
    })
  })
})
