import { ChainId, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { RootState } from 'modules/common/types'
import { SyncStatus } from 'modules/item/types'
import { ThirdParty } from 'modules/thirdParty/types'
import {
  getAuthorizedCollections,
  getCollectionItemCount,
  getStatusByCollectionId,
  getUnsyncedCollectionError,
  hasViewAndEditRights
} from './selectors'
import { Collection } from './types'
import { UNSYNCED_COLLECTION_ERROR_PREFIX } from './utils'

jest.mock('decentraland-dapps/dist/lib/eth')
const mockGetChainIdByNetwork = getChainIdByNetwork as jest.Mock

describe('when getting the unsynced error message', () => {
  let state: RootState

  beforeEach(() => {
    state = {
      collection: {}
    } as RootState
  })

  describe('when the base error is null', () => {
    beforeEach(() => {
      state.collection.error = null
    })

    it('should return null', () => {
      expect(getUnsyncedCollectionError(state)).toBeNull()
    })
  })

  describe('when the base error does not match an unsynced collection error', () => {
    beforeEach(() => {
      state.collection.error = 'Not an unsynced collection error'
    })

    it('should return null', () => {
      expect(getUnsyncedCollectionError(state)).toBeNull()
    })
  })

  describe('when the base error matches an unsynced collection error', () => {
    beforeEach(() => {
      state.collection.error = UNSYNCED_COLLECTION_ERROR_PREFIX + ' Some error'
    })

    it('should return the base error message', () => {
      expect(getUnsyncedCollectionError(state)).toBe(state.collection.error)
    })
  })
})

describe('when getting status by item id', () => {
  it('should return the status for each published item', () => {
    mockGetChainIdByNetwork.mockReturnValue(ChainId.MATIC_MAINNET)
    const mockState = {
      collectionCuration: {
        data: {
          '1': {
            id: '1',
            collectionId: '1',
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
          '1': {
            id: '1',
            collectionId: '0',
            tokenId: 'anotherTokenId',
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
          '2': {
            id: '2',
            collectionId: '1',
            isPublished: true
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
              id: 'urn:decentraland:matic:collections-v2:anAddress:aTokenId',
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
              id: 'urn:decentraland:matic:collections-v2:anAddress:anotherTokenId',
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
    expect(getStatusByCollectionId((mockState as unknown) as RootState)).toEqual({
      '0': SyncStatus.UNSYNCED,
      '1': SyncStatus.UNDER_REVIEW
    })
  })
})

describe('when getting the authorized collections', () => {
  let collections: Collection[]
  let thirdParties: Record<string, ThirdParty>
  let address: string
  let thirdPartyId: string

  beforeEach(() => {
    collections = []
    thirdPartyId = 'urn:decentraland:ropsten:collections-thirdparty:third-party-1'
    address = '0x0'
    thirdParties = {
      [thirdPartyId]: {
        id: thirdPartyId,
        managers: [address],
        name: 'aName',
        description: 'aDescription',
        maxItems: '120',
        totalItems: '100'
      }
    }
  })

  describe("and there's a third party collection", () => {
    let thirdPartyCollection: Collection

    beforeEach(() => {
      thirdPartyCollection = {
        id: 'anId',
        name: 'aName',
        owner: '',
        urn: `${thirdPartyId}:collection-id`,
        isPublished: false,
        isApproved: false,
        minters: [],
        managers: [],
        createdAt: 20,
        updatedAt: 30
      }
      collections.push(thirdPartyCollection)
    })

    describe('and the user is manager of the third party collection', () => {
      it('should return the third party collection', () => {
        expect(getAuthorizedCollections.resultFunc(collections, address, thirdParties)).toEqual([collections[0]])
      })
    })

    describe('and the user is not manager of the third party collection', () => {
      beforeEach(() => {
        thirdParties[thirdPartyId].managers = ['anotherAddress']
      })

      it('should not return the third party collection', () => {
        expect(getAuthorizedCollections.resultFunc(collections, address, thirdParties)).toEqual([])
      })
    })

    describe("and the third party of the collection doesn't exist", () => {
      beforeEach(() => {
        thirdParties = {}
      })

      it('should not return the third party collection', () => {
        expect(getAuthorizedCollections.resultFunc(collections, address, thirdParties)).toEqual([])
      })
    })
  })

  describe("and there's a decentraland collection", () => {
    let regularCollection: Collection

    beforeEach(() => {
      regularCollection = {
        id: 'anId',
        name: 'aName',
        owner: '',
        urn: 'urn:decentraland:ropsten:collections-v2:0xcf0119336c76f513b5652f551c7c4a75457efec5',
        isPublished: false,
        isApproved: false,
        minters: [],
        managers: [],
        createdAt: 20,
        updatedAt: 30
      }
      collections.push(regularCollection)
    })

    describe('and the user is owner of the collection', () => {
      beforeEach(() => {
        regularCollection.owner = address
      })

      it('should return the collection', () => {
        expect(getAuthorizedCollections.resultFunc(collections, address, thirdParties)).toEqual([regularCollection])
      })
    })

    describe('and the user is a manager of the collection', () => {
      beforeEach(() => {
        regularCollection.managers.push(address)
      })

      it('should return the collection', () => {
        expect(getAuthorizedCollections.resultFunc(collections, address, thirdParties)).toEqual([regularCollection])
      })
    })

    describe('and the user is a minter of the collection', () => {
      beforeEach(() => {
        regularCollection.minters.push(address)
      })

      it('should return the collection', () => {
        expect(getAuthorizedCollections.resultFunc(collections, address, thirdParties)).toEqual([regularCollection])
      })
    })

    describe('and the user is not owner, manager or minter of the collection', () => {
      beforeEach(() => {
        regularCollection.minters = []
        regularCollection.managers = []
        regularCollection.owner = ''
      })

      it('should not return the collection', () => {
        expect(getAuthorizedCollections.resultFunc(collections, address, thirdParties)).toEqual([])
      })
    })
  })
})

describe('when getting if the user has view or edit rights over a collection', () => {
  let state: RootState
  let address: string
  let collection: Collection
  const thirdPartyId = 'urn:decentraland:matic:collections-thirdparty:some-tp-name'

  beforeEach(() => {
    address = '0x0'
    state = {
      thirdParty: {
        data: {
          [thirdPartyId]: {
            managers: [address]
          } as ThirdParty
        },
        loading: [],
        error: null
      }
    } as any
    collection = {} as Collection
  })

  describe('and the user is a manager of the third party of the collection', () => {
    beforeEach(() => {
      collection = { owner: 'some-other-owner', urn: `${thirdPartyId}:some-collection-id`, managers: ['aManager'] } as Collection
    })

    it('should return true', () => {
      expect(hasViewAndEditRights(state, address, collection)).toBe(true)
    })
  })

  describe('and the collection is a regular collection', () => {
    beforeEach(() => {
      address = 'anotherAddress'
      collection = {
        urn: 'urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8',
        managers: ['aManager']
      } as Collection
    })

    describe('and the user owns the collection', () => {
      beforeEach(() => {
        collection = { ...collection, owner: address }
      })

      it('should return true', () => {
        expect(hasViewAndEditRights(state, address, collection)).toBe(true)
      })
    })

    describe("and the user doesn't own the collection", () => {
      beforeEach(() => {
        collection = { ...collection, owner: 'some-other-owner', managers: [] }
      })

      it('should return false', () => {
        expect(hasViewAndEditRights(state, address, collection)).toBe(false)
      })
    })

    describe('and the user is manager of the collection', () => {
      beforeEach(() => {
        collection = { ...collection, owner: 'some-other-owner', managers: [address] }
      })

      it('should return true', () => {
        expect(hasViewAndEditRights(state, address, collection)).toBe(true)
      })
    })

    describe('and the user is not a manager of the collection', () => {
      beforeEach(() => {
        collection = { ...collection, owner: 'some-other-owner', managers: ['yetAnotherAddress'] }
      })

      it('should return false', () => {
        expect(hasViewAndEditRights(state, address, collection)).toBe(false)
      })
    })
  })
})

describe('when getting the items count by collection', () => {
  let collections: Collection[]
  let mockState: RootState

  beforeEach(() => {
    collections = [
      {
        id: '0',
        contractAddress: 'anAddress',
        itemCount: 5
      } as Collection,
      {
        id: '1',
        contractAddress: 'anotherAddress'
      } as Collection
    ]
    mockState = ({
      collection: {
        data: {
          '0': collections[0],
          '1': collections[1]
        }
      }
    } as unknown) as RootState
  })

  describe('and it has the itemCount field defined', () => {
    it('should return the collection itemCount value', () => {
      expect(getCollectionItemCount(mockState, collections[0].id)).toEqual(collections[0].itemCount)
    })
  })
  describe('and it is missing itemCount field', () => {
    it('should return the fallback value for the selector', () => {
      expect(getCollectionItemCount(mockState, collections[1].id)).toEqual(0)
    })
  })
})
