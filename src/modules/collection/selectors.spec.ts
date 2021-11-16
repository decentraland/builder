import { ChainId, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { RootState } from 'modules/common/types'
import { SyncStatus } from 'modules/item/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { getAuthorizedCollections, getStatusByCollectionId } from './selectors'
import { Collection } from './types'

jest.mock('decentraland-dapps/dist/lib/eth')
const mockGetChainIdByNetwork = getChainIdByNetwork as jest.Mock

describe('when getting status by item id', () => {
  it('should return the status for each published item', () => {
    mockGetChainIdByNetwork.mockReturnValue(ChainId.MATIC_MAINNET)
    const mockState = {
      curation: {
        data: {
          '1': {
            id: '1',
            collectionId: '1',
            status: 'pending'
          }
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
            collectionId: '1'
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
