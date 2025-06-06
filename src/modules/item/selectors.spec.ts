import { ChainId, Rarity, Entity } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { CollectionState } from 'modules/collection/reducer'
import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { CollectionCurationState } from 'modules/curations/collectionCuration/reducer'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCurationState } from 'modules/curations/itemCuration/reducer'
import { CurationStatus } from 'modules/curations/types'
import { FETCH_ENTITIES_BY_POINTERS_REQUEST } from 'modules/entity/actions'
import { EntityState } from 'modules/entity/reducer'
import { ThirdParty } from 'modules/thirdParty/types'
import { mockedItem } from 'specs/item'
import { ItemState } from './reducer'
import {
  getAuthorizedItems,
  getIdsOfItemsBeingSaved,
  getItem,
  getItems,
  getPaginatedCollectionItems,
  getPaginatedWalletOrphanItems,
  getRarities,
  getStatusByItemId,
  getStatusForItemIds,
  getWalletItems,
  getWalletOrphanItems,
  hasUserOrphanItems,
  hasViewAndEditRights,
  getMissingEntities
} from './selectors'
import { Item, ItemType, SyncStatus, VIDEO_PATH } from './types'
import { saveItemRequest } from './actions'

jest.mock('decentraland-dapps/dist/lib/eth')
const mockGetChainIdByNetwork = getChainIdByNetwork as jest.Mock

const mockAddress = '0x6D7227d6F36FC997D53B4646132b3B55D751cc7c'

describe('Item selectors', () => {
  let item: Item
  let anotherItem: Item
  let yetAnotherItem: Item
  let state: RootState

  beforeEach(() => {
    item = { id: 'anId', name: 'anItem', collectionId: 'someId', owner: 'anAddress' } as Item
    anotherItem = { id: 'anotherId', name: 'anotherItem', collectionId: 'someId', owner: 'anAddress' } as Item
    yetAnotherItem = { id: 'yetAnotherId', name: 'yetAnotherItem', collectionId: 'someId', owner: 'anAddress' } as Item
    state = {
      item: {
        data: {
          [item.id]: item,
          [anotherItem.id]: anotherItem,
          [yetAnotherItem.id]: yetAnotherItem
        },
        pagination: {
          [item.collectionId!]: {
            ids: [item.id],
            total: 1,
            limit: 5,
            pages: 1,
            page: 1
          },
          [mockAddress]: {
            ids: [anotherItem.id, yetAnotherItem.id],
            total: 1,
            limit: 5,
            pages: 1,
            page: 1
          }
        },
        rarities: [
          { id: Rarity.COMMON, name: Rarity.COMMON, price: '100', maxSupply: 100 },
          { id: Rarity.EXOTIC, name: Rarity.EXOTIC, price: '100', maxSupply: 50 }
        ]
      },
      entity: {
        data: {},
        loading: [],
        error: null
      }
    } as any
  })

  describe('when getting the items', () => {
    it('should return the list of items available in the state', () => {
      expect(getItems(state)).toEqual([item, anotherItem, yetAnotherItem])
    })
  })

  describe('when getting a collection paginated items', () => {
    it('should return the list of items for the asked page', () => {
      expect(getPaginatedCollectionItems(state, item.collectionId!, 1)).toEqual([item])
    })
  })

  describe('when getting paginated wallet orphan items', () => {
    let pageSize: number
    describe('and passing pageSize', () => {
      beforeEach(() => {
        pageSize = 1
      })
      it('should return the list of orphan items for the asked page', () => {
        expect(getPaginatedWalletOrphanItems(state, mockAddress, pageSize)).toEqual([anotherItem])
      })
    })
    describe('and not passing pageSize', () => {
      it('should return the list of orphan items for the asked page', () => {
        expect(getPaginatedWalletOrphanItems(state, mockAddress)).toEqual([anotherItem, yetAnotherItem])
      })
    })
  })

  describe('when getting an item', () => {
    describe('when the item exists in the state', () => {
      it('should return the item', () => {
        expect(getItem(state, item.id)).toEqual(item)
      })
    })

    describe('when the item does not exists in the state', () => {
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
    const itemId = 'anItemId'
    const collectionId = 'aCollectionId'

    beforeEach(() => {
      mockGetChainIdByNetwork.mockReturnValue(ChainId.MATIC_MAINNET)

      state = {
        collectionCuration: {
          data: {},
          loading: [],
          error: null
        } as CollectionCurationState,
        itemCuration: {
          data: {},
          loading: [],
          error: null
        } as ItemCurationState,
        item: {
          data: {
            [itemId]: {
              ...mockedItem,
              id: itemId,
              collectionId: collectionId
            } as Item<ItemType.WEARABLE>
          },
          rarities: [],
          loading: [],
          error: null,
          pagination: null,
          hasUserOrphanItems: undefined
        } as ItemState,
        collection: {
          data: {
            [collectionId]: {
              id: collectionId
            } as Collection
          },
          loading: [],
          error: null,
          pagination: null,
          lastFetchParams: undefined
        } as CollectionState,
        entity: {
          data: {},
          loading: [],
          error: null
        } as EntityState
      } as RootState
    })

    describe('and the item is belongs to a TP', () => {
      beforeEach(() => {
        state.collection.data[collectionId].urn = 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:a-collection-id'
        state.item.data[itemId].urn = 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:a-collection-id:an-item-id'
      })

      describe('and the item is not published nor has an item curation', () => {
        beforeEach(() => {
          state.item.data[itemId].isPublished = false
          state.itemCuration.data[collectionId] = []
        })

        it('should return a map where the item id of the tested item is set as unpublished', () => {
          expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNPUBLISHED })
        })
      })

      describe('and the item has item curation with a pending status', () => {
        beforeEach(() => {
          state.item.data[itemId].isPublished = true
          state.itemCuration.data[collectionId] = [
            {
              id: 'anItemCurationId',
              itemId,
              status: CurationStatus.PENDING,
              contentHash: 'someHash',
              createdAt: 0,
              updatedAt: 0
            }
          ]
        })

        it('should return a map where the item id of the tested item is set as under review', () => {
          expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNDER_REVIEW })
        })
      })

      describe('and the item has a pending curation with an approved status', () => {
        beforeEach(() => {
          state.item.data[itemId].isPublished = true
          state.itemCuration.data[collectionId] = [
            {
              id: 'anItemCurationId',
              itemId,
              status: CurationStatus.APPROVED,
              contentHash: 'someHash',
              createdAt: 0,
              updatedAt: 0
            }
          ]
        })

        describe('and the catalyst hash is different from the current content hash', () => {
          beforeEach(() => {
            state.item.data[itemId].currentContentHash = 'someHash'
            state.item.data[itemId].catalystContentHash = 'aDifferentHash'
          })

          it('should return a map where the item id of the tested item is set unsynced', () => {
            expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNSYNCED })
          })
        })

        describe('and the catalyst hash is the same as the current content hash', () => {
          beforeEach(() => {
            state.item.data[itemId].currentContentHash = state.item.data[itemId].catalystContentHash
          })

          it('should return a map where the item id of the tested item is set as synced', () => {
            expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.SYNCED })
          })

          describe('and the item is a smart wearable', () => {
            beforeEach(() => {
              state.item.data[itemId].video = 'aVideoHash'
              state.item.data[itemId].contents['game.js'] = 'aHash'
              state.item.data[itemId].contents[VIDEO_PATH] = 'aVideoHash'
            })

            afterEach(() => {
              // Restore item state
              state.item.data[itemId].video = undefined
              delete state.item.data[itemId].contents['game.js']
              delete state.item.data[itemId].contents[VIDEO_PATH]
            })

            it('should return a map where the item id of the tested item is set as unsynced', () => {
              expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.SYNCED })
            })

            describe('and the item has an updated video', () => {
              beforeEach(() => {
                state.item.data[itemId].contents[VIDEO_PATH] = 'aDifferentVideoHash'
              })

              it('should return a map where the item id of the tested item is set as unsynced', () => {
                expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNSYNCED })
              })
            })
          })
        })
      })
    })

    describe('and the items belongs to a standard collection', () => {
      beforeEach(() => {
        state.collection.data[collectionId].urn = 'urn:decentraland:matic:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'
      })

      describe('and the item is not published', () => {
        beforeEach(() => {
          state.item.data[itemId].urn = undefined
          state.item.data[itemId].isPublished = false
        })

        it('should return a map where the item id of the tested item is set as unpublished', () => {
          expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNPUBLISHED })
        })
      })

      describe('and the item is published', () => {
        beforeEach(() => {
          state.item.data[itemId] = {
            ...state.item.data[itemId],
            urn: 'urn:decentraland:matic:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311:0',
            tokenId: '0',
            isPublished: true
          }

          state.collection.data[collectionId] = {
            ...state.collection.data[collectionId],
            isPublished: true,
            contractAddress: '0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'
          }

          state.collectionCuration.data[collectionId] = {
            id: '0',
            collectionId,
            status: CurationStatus.APPROVED
          } as CollectionCuration
        })

        describe("and the item's collection curation is pending", () => {
          beforeEach(() => {
            state.item.data[itemId] = {
              ...state.item.data[itemId],
              isApproved: false
            }

            state.collection.data[collectionId].isApproved = false
            state.collectionCuration.data[collectionId].status = CurationStatus.PENDING
          })

          it('should return a map where the item id of the tested item is set as under review', () => {
            expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNDER_REVIEW })
          })
        })

        describe('and the item is not approved yet', () => {
          beforeEach(() => {
            state.item.data[itemId].isApproved = false
            state.collection.data[collectionId].isApproved = false
          })

          it('should return a map where the item id of the tested item is set as under review', () => {
            expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNDER_REVIEW })
          })
        })

        describe('and the item is approved', () => {
          beforeEach(() => {
            state.item.data[itemId].isApproved = true
            state.collection.data[collectionId].isApproved = true
            state.collectionCuration.data[collectionId].status = CurationStatus.APPROVED
          })

          describe('and the entity is being fetched', () => {
            beforeEach(() => {
              state.collectionCuration.data = {}
              state.entity.loading = [{ type: FETCH_ENTITIES_BY_POINTERS_REQUEST }]
            })

            it('should return a map where the item id of the tested item is set as loading', () => {
              expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.LOADING })
            })
          })

          describe('and the entity is not synced with the item', () => {
            beforeEach(() => {
              state.entity.data[state.item.data[itemId].urn!] = {
                content: [{ key: 'someFile.glb', hash: 'aDifferentHash' }] as unknown,
                metadata: {
                  id: state.item.data[itemId].urn,
                  name: 'aDifferentName',
                  description: 'aDifferentDescription',
                  data: {
                    category: state.item.data[itemId].data.category,
                    replaces: state.item.data[itemId].data.replaces,
                    hides: state.item.data[itemId].data.hides,
                    representations: state.item.data[itemId].data.representations,
                    tags: state.item.data[itemId].data.tags
                  }
                },
                pointers: [state.item.data[itemId].urn!]
              } as Entity
            })

            it('should return a map where the item id of the tested item is set as unsynced', () => {
              expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNSYNCED })
            })
          })

          describe('and the entity is synced with the item', () => {
            beforeEach(() => {
              state.entity.data[state.item.data[itemId].urn!] = {
                content: Object.keys(state.item.data[itemId].contents).map(key => ({
                  hash: state.item.data[itemId].contents[key],
                  file: key
                })),
                metadata: {
                  id: state.item.data[itemId].urn,
                  name: state.item.data[itemId].name,
                  description: state.item.data[itemId].description,
                  data: {
                    category: state.item.data[itemId].data.category,
                    replaces: state.item.data[itemId].data.replaces,
                    hides: state.item.data[itemId].data.hides,
                    representations: state.item.data[itemId].data.representations,
                    tags: state.item.data[itemId].data.tags
                  }
                },
                pointers: [state.item.data[itemId].urn!]
              } as Entity
            })

            it('should return a map where the item id of the tested item is set as synced', () => {
              expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.SYNCED })
            })
          })

          describe('and there is no entity', () => {
            beforeEach(() => {
              // Set up a published and approved item
              state.item.data[itemId].isPublished = true
              state.item.data[itemId].isApproved = true

              // Add URN to the item
              state.item.data[itemId].urn = 'urn:decentraland:matic:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'

              // Clear entities data to simulate missing entity
              state.entity.data = {}
            })

            it('should return a map where the item id of the tested item is set as UNSYNCED', () => {
              expect(getStatusByItemId(state)).toEqual({ [itemId]: SyncStatus.UNSYNCED })
            })
          })
        })
      })
    })

    describe('when getting the status by id', () => {
      const anotherItemId = 'anotherItemId'
      const anotherCollectionId = 'anotherCollectionId'

      beforeEach(() => {
        // First item
        state.collection.data[collectionId].urn = 'urn:decentraland:matic:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'

        state.item.data[itemId] = {
          ...state.item.data[itemId],
          urn: undefined,
          isPublished: false
        }

        //Second item
        state.item.data[anotherItemId] = {
          ...state.item.data[anotherItemId],
          id: anotherItemId,
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:a-collection-id:an-item-id',
          tokenId: '0',
          isPublished: true
        }

        state.collection.data[anotherCollectionId] = {
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:a-collection-id:an-item-id',
          id: anotherCollectionId,
          isPublished: true
        } as Collection

        state.itemCuration.data[anotherCollectionId] = [
          {
            id: 'anItemCurationId',
            itemId: anotherItemId,
            status: CurationStatus.PENDING,
            contentHash: 'someHash',
            createdAt: 0,
            updatedAt: 0
          }
        ]
      })

      it('should return the status by id for a list of item ids', () => {
        expect(getStatusForItemIds(state as unknown as RootState, [itemId, anotherItemId])).toEqual({
          [itemId]: SyncStatus.UNPUBLISHED,
          [anotherItemId]: SyncStatus.UNDER_REVIEW
        })
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
            collection = {
              owner: address,
              minters: [],
              managers: []
            } as any as Collection
          })

          it('should return true', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(true)
          })
        })

        describe("and the user can't see the item", () => {
          beforeEach(() => {
            collection = {
              owner: 'some-other-address',
              minters: [],
              managers: []
            } as any as Collection
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
        item.urn = 'urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:0'
      })

      describe('and the item has a collection', () => {
        describe('and the user can see the item', () => {
          beforeEach(() => {
            collection = {
              owner: address,
              minters: [],
              managers: []
            } as any as Collection
          })

          it('should return true', () => {
            expect(hasViewAndEditRights(state, address, collection, item)).toBe(true)
          })
        })

        describe("and the user can't see the item", () => {
          beforeEach(() => {
            collection = {
              owner: 'some-other-address',
              minters: [],
              managers: []
            } as any as Collection
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

  describe('when getting if the user has orphan items', () => {
    describe('when requesting orphan items', () => {
      beforeEach(() => {
        state = {
          ...state,
          item: {
            ...state.item,
            hasUserOrphanItems: undefined
          }
        } as RootState
      })

      it('should return undefined', () => {
        expect(hasUserOrphanItems(state)).toEqual(undefined)
      })
    })
    describe('when there are orphan items', () => {
      beforeEach(() => {
        state = {
          ...state,
          item: {
            ...state.item,
            hasUserOrphanItems: true
          }
        } as RootState
      })

      it('should return true', () => {
        expect(hasUserOrphanItems(state)).toEqual(true)
      })
    })
    describe('when there are not orphan items', () => {
      beforeEach(() => {
        state = {
          ...state,
          item: {
            ...state.item,
            hasUserOrphanItems: false
          }
        } as RootState
      })

      it('should return false', () => {
        expect(hasUserOrphanItems(state)).toEqual(false)
      })
    })
  })

  describe('when getting the ids of the items being saved', () => {
    describe('and there are no items being saved', () => {
      beforeEach(() => {
        state = {
          ...state,
          item: {
            ...state.item,
            loading: []
          }
        } as RootState
      })

      it('should return an empty object', () => {
        expect(getIdsOfItemsBeingSaved(state)).toEqual({})
      })
    })

    describe('and there are items being saved', () => {
      beforeEach(() => {
        state = {
          ...state,
          item: {
            ...state.item,
            loading: [saveItemRequest(item, {})]
          }
        } as RootState
      })

      it('should return the ids of the items being saved', () => {
        expect(getIdsOfItemsBeingSaved(state)).toEqual({ [item.id]: true })
      })
    })
  })

  describe('when getting items with missing entities', () => {
    let items: Item[]
    let entities: Entity[]

    beforeEach(() => {
      items = [
        { id: '1', urn: 'urn:decentraland:item1' },
        { id: '2', urn: 'urn:decentraland:item2' },
        { id: '3', urn: 'urn:decentraland:item3' }
      ] as Item[]

      entities = [
        { id: 'entity1', pointers: ['urn:decentraland:item1'] },
        { id: 'entity2', pointers: ['urn:decentraland:item2'] }
      ] as Entity[]

      state = {
        ...state,
        item: {
          ...state.item,
          data: items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})
        },
        entity: {
          ...state.entity,
          data: entities.reduce((acc, entity) => ({ ...acc, [entity.id]: entity }), {})
        }
      } as RootState
    })

    describe('when an item does not have a corresponding entity', () => {
      it('should mark the item as missing', () => {
        const result = getMissingEntities(state)
        expect(result).toEqual({
          'urn:decentraland:item3': true
        })
      })
    })

    describe('when all items have corresponding entities', () => {
      beforeEach(() => {
        entities.push({ id: 'entity3', pointers: ['urn:decentraland:item3'] } as Entity)
        state = {
          ...state,
          entity: {
            ...state.entity,
            data: entities.reduce((acc, entity) => ({ ...acc, [entity.id]: entity }), {})
          }
        } as RootState
      })

      it('should return an empty object', () => {
        const result = getMissingEntities(state)
        expect(result).toEqual({})
      })
    })

    describe('when an item has no URN', () => {
      beforeEach(() => {
        items.push({ id: '4' } as Item)
        state = {
          ...state,
          item: {
            ...state.item,
            data: items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})
          }
        } as RootState
      })

      it('should not include the item in missing entities', () => {
        const result = getMissingEntities(state)
        expect(result).not.toHaveProperty('4')
      })
    })
  })
})
