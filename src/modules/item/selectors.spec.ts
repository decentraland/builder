import { ChainId, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { getAuthorizedItems, getItem, getItems, getRarities, getStatusByItemId, getWalletItems, getWalletOrphanItems } from './selectors'
import { Item, ItemRarity, SyncStatus } from './types'

jest.mock('decentraland-dapps/dist/lib/eth')
const mockGetChainIdByNetwork = getChainIdByNetwork as jest.Mock

describe('Item selectors', () => {
  let item: Item
  let state: RootState

  beforeEach(() => {
    item = { id: 'anId', name: 'anItem', collectionId: 'someId', owner: 'anAddress' } as Item
    state = {
      item: {
        data: {
          [item.id]: item
        }
      },
      rarities: [{ id: ItemRarity.COMMON, name: ItemRarity.COMMON, price: '100', maxSupply: 100 }]
    } as any
  })

  describe('when getting the items', () => {
    it('should return the list of items available in the state', () => {
      expect(getItems(state)).toEqual([item])
    })
  })

  describe('when getting an item', () => {
    describe('when the item exists in the state', () => {
      it('should return the item', () => {
        expect(getItem(state, item.id)).toEqual(item)
      })
    })

    describe('when the item exists in the state', () => {
      it('should return null', () => {
        expect(getItem(state, 'aNonExistaetId')).toBeNull()
      })
    })
  })

  describe('when getting the authorized items', () => {
    let items: Item[]
    let collections: Collection[]
    let address: string

    beforeEach(() => {
      address = 'anAddress'
      const aCollection = {
        id: 'aCollectionId',
        owner: address,
        managers: [] as string[],
        minters: [] as string[]
      } as Collection
      const itemInCollection = {
        id: 'anItemId',
        owner: address,
        collectionId: aCollection.id
      } as Item
      const itemNotInCollection = {
        id: 'anotherItemId',
        owner: 'anotherAddress',
        collectionId: 'someCollectionId'
      } as Item

      collections = [aCollection]
      items = [itemInCollection, itemNotInCollection]
    })

    describe("when there aren't any collections but there are many items", () => {
      it('should return only the owned items', () => {
        expect(getAuthorizedItems.resultFunc([], items, address)).toEqual([items[0]])
      })
    })

    describe("when there aren't any items", () => {
      it("shouldn't return any items", () => {
        expect(getAuthorizedItems.resultFunc(collections, [], address)).toEqual([])
      })
    })

    describe("when there's no address", () => {
      it("shouldn't return any items", () => {
        expect(getAuthorizedItems.resultFunc(collections, items, undefined)).toEqual([])
      })
    })

    describe('when there are items that can be seen by the address', () => {
      it('should return the items that can be seen by the address', () => {
        expect(getAuthorizedItems.resultFunc(collections, items, address)).toEqual([items[0]])
      })
    })
  })

  describe('when getting the orphaned wallet items', () => {
    it("should return the items that don't have a collection id", () => {
      const orphanedItem = { id: 'anItemID', collectionId: undefined } as Item
      expect(getWalletOrphanItems.resultFunc([orphanedItem, item])).toEqual([orphanedItem])
    })
  })

  describe('when getting the wallet items', () => {
    it('should return the items that belong to the wallet', () => {
      const anItemThatDoesntBelongToTheWallet = { id: 'anItemID', owner: 'someAddress' } as Item
      expect(getWalletItems.resultFunc([anItemThatDoesntBelongToTheWallet, item], item.owner)).toEqual([item])
    })
  })

  describe('when getting the rarities', () => {
    it('should return the rarities', () => {
      expect(getRarities(state)).toEqual(state.item.rarities)
    })
  })

  describe('when getting status by item id', () => {
    it('should return the status for each published item', () => {
      mockGetChainIdByNetwork.mockReturnValue(ChainId.MATIC_MAINNET)
      const mockState = {
        item: {
          data: {
            '0': {
              id: '0',
              collectionId: '0',
              tokenId: 'aTokenId',
              isPublished: true,
              isApproved: false
            },
            '1': {
              id: '1',
              collectionId: '1',
              tokenId: 'anotherTokenId',
              isPublished: true,
              isApproved: true,
              contents: {
                'file.ext': 'QmA'
              },
              name: 'pepito',
              description: 'yes it is a pepito',
              data: {
                category: WearableCategory.HAT,
                replaces: [],
                hides: [],
                representations: [],
                tags: []
              }
            },
            '2': {
              id: '2',
              collectionId: '2',
              tokenId: 'yetAnotherTokenId',
              isPublished: true,
              isApproved: true,
              contents: {
                'file.ext': 'QmB_new'
              },
              name: 'pepito',
              description: 'pepito hat very nice',
              data: {
                category: WearableCategory.HAT,
                replaces: [],
                hides: [],
                representations: [],
                tags: []
              }
            }
          }
        },
        collection: {
          data: {
            '0': {
              id: '0',
              contractAddress: 'anAddress'
            },
            '1': {
              id: '1',
              contractAddress: 'anotherAddress'
            },
            '2': {
              id: '2',
              contractAddress: 'yetAnotherAddress'
            }
          }
        },
        entity: {
          data: {
            Qm1: {
              content: [
                {
                  hash: 'QmA',
                  key: 'file.ext'
                }
              ],
              metadata: {
                id: 'urn:decentraland:matic:collections-v2:anotherAddress:anotherTokenId',
                name: 'pepito',
                description: 'yes it is a pepito',
                data: {
                  category: WearableCategory.HAT,
                  replaces: [],
                  hides: [],
                  representations: [],
                  tags: []
                }
              }
            },
            Qm2: {
              content: [
                {
                  hash: 'QmB',
                  key: 'file.ext'
                }
              ],
              metadata: {
                id: 'urn:decentraland:matic:collections-v2:yetAnotherAddress:yetAnotherTokenId',
                name: 'pepito',
                description: 'pepito hat very nice',
                data: {
                  category: WearableCategory.HAT,
                  replaces: [],
                  hides: [],
                  representations: [],
                  tags: []
                }
              }
            }
          }
        }
      }
      expect(getStatusByItemId((mockState as unknown) as RootState)).toEqual({
        '0': SyncStatus.UNDER_REVIEW,
        '1': SyncStatus.SYNCED,
        '2': SyncStatus.UNSYNCED
      })
    })
  })
})
