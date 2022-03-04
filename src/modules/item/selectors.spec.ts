import { ChainId, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { ThirdParty } from 'modules/thirdParty/types'
import {
  getAuthorizedItems,
  getItem,
  getItems,
  getRarities,
  getStatusByItemId,
  getStatusForItemIds,
  getWalletItems,
  getWalletOrphanItems,
  hasViewAndEditRights
} from './selectors'
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

  describe('when getting status', () => {
    mockGetChainIdByNetwork.mockReturnValue(ChainId.MATIC_MAINNET)
    const mockState = {
      collectionCuration: {
        data: {
          '0': {
            id: '0',
            collectionId: '0',
            status: 'approved'
          },
          '1': {
            id: '1',
            collectionId: '1',
            status: 'rejected'
          },
          '3': {
            id: '3',
            collectionId: '3',
            status: 'pending'
          }
        }
      },
      itemCuration: {
        data: {
          '0': [
            {
              id: '0',
              itemId: '0',
              status: 'approved'
            },
            {
              id: '1',
              itemId: '1',
              status: 'rejected'
            },
            {
              id: '3',
              itemId: '3',
              status: 'pending'
            },
            {
              id: '11',
              itemId: '11',
              status: 'approved'
            },
            {
              id: '12',
              itemId: '12',
              status: 'approved'
            }
          ],
          '4': [
            {
              id: '4',
              itemId: '5',
              status: 'pending'
            },
            {
              id: '5',
              itemId: '6',
              status: 'approved'
            },
            {
              id: '6',
              itemId: '7',
              status: 'approved'
            },
            {
              id: '7',
              itemId: '8',
              status: 'approved'
            }
          ]
        }
      },
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
          },
          '3': {
            id: '3',
            collectionId: '3',
            tokenId: 'yetAnotherDifferentTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'file.ext': 'QmC_new'
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
          },
          '4': {
            id: '4',
            collectionId: '4',
            tokenId: 'yetAnotherDifferentTokenId',
            isPublished: false,
            isApproved: false,
            contents: {
              'file.ext': 'QmC_new'
            },
            name: 'pepito',
            description: 'pepito hat very nice',
            urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:the-real-deal', // TP
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            }
          },
          '5': {
            id: '5',
            collectionId: '4',
            tokenId: 'yetAnotherDifferentTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'file.ext': 'QmC_new'
            },
            name: 'pepito',
            description: 'pepito hat very nice',
            urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:the-real-deal', // TP
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            }
          },
          '6': {
            id: '6',
            collectionId: '4',
            tokenId: 'TPTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'file.ext': 'QmC_new'
            },
            name: 'pepito',
            description: 'pepito hat very nice',
            urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:the-real-deal', // TP
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            }
          },
          '7': {
            id: '7',
            collectionId: '4',
            tokenId: 'anotherDifferentTPTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'file.ext': 'QmC_new'
            },
            name: 'pepito',
            description: 'pepito hat very nice',
            urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:the-real-deal', // TP
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            }
          },
          '8': {
            id: '8',
            collectionId: '4',
            tokenId: 'yetAnotherDifferentTPTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'file.ext': 'QmC_new'
            },
            name: 'pepito',
            description: 'pepito hat very nice',
            urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:the-real-deal', // TP
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            }
          },
          '9': {
            id: '9',
            collectionId: '0',
            tokenId: 'otherTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'anotherFile.ext': 'anotherFileHash'
            },
            name: 'Item with same content hash and local content hash',
            description: 'pepito hat very nice',
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            },
            contentHash: 'aContentHash',
            serverContentHash: 'aContentHash'
          },
          '10': {
            id: '10',
            collectionId: '0',
            tokenId: 'theTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'someFile.ext': 'aFileHash'
            },
            name: 'Item with different content hash and local content hash',
            description: 'pepito hat very nice',
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            },
            contentHash: 'aContentHash',
            serverContentHash: 'someOtherContentHash'
          },
          '11': {
            id: '11',
            urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:the-real-deal:11', // TP
            collectionId: '3',
            tokenId: 'theTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'someFile.ext': 'aFileHash'
            },
            name: 'Item with different content hash and local content hash',
            description: 'pepito hat very nice',
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            },
            contentHash: 'aContentHash',
            serverContentHash: 'aContentHash'
          },
          '12': {
            id: '12',
            urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:the-real-deal:12', // TP
            collectionId: '3',
            tokenId: 'theTokenId',
            isPublished: true,
            isApproved: true,
            contents: {
              'someFile.ext': 'aFileHash'
            },
            name: 'Item with different content hash and local content hash',
            description: 'pepito hat very nice',
            data: {
              category: WearableCategory.HAT,
              replaces: [],
              hides: [],
              representations: [],
              tags: []
            },
            contentHash: 'aContentHash',
            serverContentHash: 'someOtherContentHash'
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
          },
          '3': {
            id: '3',
            contractAddress: 'yetAnotherDifferentAddress'
          },
          '4': {
            id: '4',
            contractAddress: 'TPAddress'
          }
        }
      },
      entity: {
        data: {
          Qm1: {
            content: [
              {
                hash: 'QmA',
                file: 'file.ext'
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
                file: 'file.ext'
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
          },
          Qm3: {
            content: [
              {
                hash: 'QmC',
                file: 'file.ext'
              }
            ],
            metadata: {
              id: 'urn:decentraland:matic:collections-v2:yetAnotherDifferentAddress:yetAnotherDifferentTokenId',
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
          },
          Qm4: {
            content: [
              {
                hash: 'QmC',
                file: 'file.ext'
              }
            ],
            metadata: {
              id: 'urn:decentraland:matic:collections-v2:TPAddress:anotherDifferentTPTokenId',
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
          },
          Qm5: {
            content: [
              {
                hash: 'QmC_new',
                file: 'file.ext'
              }
            ],
            metadata: {
              id: 'urn:decentraland:matic:collections-v2:TPAddress:yetAnotherDifferentTPTokenId',
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

    it('should return the status by id for each published item', () => {
      expect(getStatusByItemId((mockState as unknown) as RootState)).toEqual({
        '0': SyncStatus.UNDER_REVIEW,
        '1': SyncStatus.SYNCED,
        '2': SyncStatus.UNSYNCED,
        '3': SyncStatus.UNDER_REVIEW,
        '4': SyncStatus.UNPUBLISHED, // TP with no item curation
        '5': SyncStatus.UNDER_REVIEW, // TP with item curation in PENDING
        '6': SyncStatus.LOADING, // TP with item curation in APPROVED and no Entity,
        '7': SyncStatus.UNSYNCED, // TP with item curation in APPROVED with entity but NOT synced,
        '8': SyncStatus.SYNCED, // TP with item curation in APPROVED with entity and synced,
        '9': SyncStatus.SYNCED, // Standard item with content hash equal to serverContentHash
        '10': SyncStatus.UNSYNCED, // Standard item with content hash not equal to serverContentHash
        '11': SyncStatus.SYNCED, // TP item with content hash not equal to serverContentHash
        '12': SyncStatus.UNSYNCED // TP item with content hash not equal to serverContentHash
      })
    })

    it('should return the status by id for a list of item Ids', () => {
      expect(getStatusForItemIds((mockState as unknown) as RootState, ['2', '4', '6', '7'])).toEqual({
        '2': SyncStatus.UNSYNCED,
        '4': SyncStatus.UNPUBLISHED,
        '6': SyncStatus.LOADING,
        '7': SyncStatus.UNSYNCED
      })
    })
  })

  describe('when getting if the item has view and edit rights', () => {
    let address: string
    let thirdPartyId: string
    let collection: Collection | null

    describe('when the item has a third party and the user is manager of that third party', () => {
      beforeEach(() => {
        address = '0x0'
        thirdPartyId = 'urn:decentraland:matic:collections-thirdparty:some-tp-name'
        item.urn = `${thirdPartyId}:the-collection-id:a-wonderful-token-id`

        state = {
          ...state,
          thirdParty: {
            data: {
              [thirdPartyId]: {
                managers: [address]
              } as ThirdParty
            }
          }
        } as RootState
      })

      it('should return true', () => {
        expect(hasViewAndEditRights(state, address, null, item)).toBe(true)
      })
    })

    describe('when the item has a third party and the user is not manger of that third party', () => {
      beforeEach(() => {
        address = '0x0'
        thirdPartyId = 'urn:decentraland:matic:collections-thirdparty:some-tp-name'
        item.urn = `${thirdPartyId}:the-collection-id:a-wonderful-token-id`

        state = {
          ...state,
          thirdParty: {
            data: {
              [thirdPartyId]: {
                managers: ['anotherAddress']
              } as ThirdParty
            }
          }
        } as RootState
      })

      describe('and the item has a collection', () => {
        describe('and the user can see the item', () => {
          beforeEach(() => {
            collection = ({
              owner: address,
              minters: [],
              managers: []
            } as any) as Collection
          })

          it('should return true', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(true)
          })
        })

        describe("and the user can't see the item", () => {
          beforeEach(() => {
            collection = ({
              owner: 'some-other-address',
              minters: [],
              managers: []
            } as any) as Collection
          })

          it('should return false', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(false)
          })
        })
      })

      describe("and the item doesn't have a collection", () => {
        beforeEach(() => {
          collection = null
        })

        describe('and the user owns the item', () => {
          beforeEach(() => {
            item.owner = address
          })

          it('should return true', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(true)
          })
        })

        describe("and the user doesn't own the item", () => {
          beforeEach(() => {
            item.owner = 'some-other-address'
          })

          it('should return false', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(false)
          })
        })
      })
    })

    describe("when the item doesn't belong to a third party", () => {
      beforeEach(() => {
        address = '0x0'
        item.urn = 'urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:0'
      })

      describe('and the item has a collection', () => {
        describe('and the user can see the item', () => {
          beforeEach(() => {
            collection = ({
              owner: address,
              minters: [],
              managers: []
            } as any) as Collection
          })

          it('should return true', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(true)
          })
        })

        describe("and the user can't see the item", () => {
          beforeEach(() => {
            collection = ({
              owner: 'some-other-address',
              minters: [],
              managers: []
            } as any) as Collection
          })

          it('should return false', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(false)
          })
        })
      })

      describe("and the item doesn't have a collection", () => {
        beforeEach(() => {
          collection = null
        })

        describe('and the user owns the item', () => {
          beforeEach(() => {
            item.owner = address
          })

          it('should return true', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(true)
          })
        })

        describe("and the user doesn't own the item", () => {
          beforeEach(() => {
            item.owner = 'some-other-address'
          })

          it('should return false', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(false)
          })
        })
      })
    })
  })
})
