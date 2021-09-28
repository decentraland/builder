import { ChainId, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { RootState } from 'modules/common/types'
import { SyncStatus } from 'modules/item/types'
import { getStatusByCollectionId } from './selectors'

jest.mock('decentraland-dapps/dist/lib/eth')
const mockGetChainIdByNetwork = getChainIdByNetwork as jest.Mock

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
          }
        }
      },
      collection: {
        data: {
          '0': {
            id: '0',
            contractAddress: 'anAddress'
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
      '0': SyncStatus.UNSYNCED
    })
  })
})
