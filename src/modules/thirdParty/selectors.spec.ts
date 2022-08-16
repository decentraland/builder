import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST } from './actions'
import {
  isThirdPartyManager,
  getWalletThirdParties,
  getCollectionThirdParty,
  getItemThirdParty,
  isDeployingBatchedThirdPartyItems
} from './selectors'
import { ThirdParty } from './types'

describe('Third Party selectors', () => {
  let address: string
  let baseState: RootState
  let thirdParty1: ThirdParty
  let thirdParty2: ThirdParty
  let thirdParty3: ThirdParty

  beforeEach(() => {
    address = '0xdeabeef'
    thirdParty1 = {
      id: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty1',
      name: 'a third party',
      description: 'some desc',
      maxItems: '0',
      totalItems: '0',
      managers: [address, '0xa']
    }
    thirdParty2 = {
      id: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2',
      name: 'a third party',
      description: 'some desc',
      maxItems: '0',
      totalItems: '0',
      managers: [address, '0xb']
    }
    thirdParty3 = {
      id: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty3',
      name: 'a third party',
      description: 'some desc',
      maxItems: '0',
      totalItems: '0',
      managers: ['0xc']
    }
    baseState = {
      wallet: {
        data: {
          address
        }
      }
    } as any
  })

  describe('when checking if the current wallet is a manager', () => {
    describe('when the address belongs to a manager list of any third party', () => {
      let state: RootState

      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            data: {
              anId: { id: 'anId', name: 'a third party', description: 'some desc', managers: [address] }
            }
          }
        } as any
      })

      it('should return true', () => {
        expect(isThirdPartyManager(state)).toBe(true)
      })
    })

    describe('when the address does not belong to a manager list of any third party', () => {
      let state: RootState

      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            data: {
              anId: { id: 'anId', name: 'a third party', description: 'some desc', managers: ['0x123123123'] }
            }
          }
        } as any
      })

      it('should return false', () => {
        expect(isThirdPartyManager(state)).toBe(false)
      })
    })
  })

  describe('when getting the wallet third parties', () => {
    let state: RootState
    let thirdParties: ThirdParty[]

    beforeEach(() => {
      thirdParties = [thirdParty1, thirdParty2]

      state = {
        ...baseState,
        thirdParty: {
          data: {
            [thirdParty1.id]: thirdParty1,
            [thirdParty2.id]: thirdParty2,
            [thirdParty3.id]: thirdParty3
          }
        }
      } as any
    })

    it('should return all third parties where the address belongs to the manager list', () => {
      expect(getWalletThirdParties(state)).toEqual(thirdParties)
    })
  })

  describe('when getting the third party of a collection', () => {
    let state: RootState
    let collection: Collection

    beforeEach(() => {
      state = {
        ...baseState,
        thirdParty: {
          ...baseState.thirdParty,
          data: {
            [thirdParty1.id]: thirdParty1,
            [thirdParty2.id]: thirdParty2,
            [thirdParty3.id]: thirdParty3
          }
        }
      }
    })

    describe("and the collection doesn't have a valid third party URN", () => {
      beforeEach(() => {
        collection = {
          urn: 'urn:decentraland:goerli:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'
        } as Collection
      })

      it('should throw with an error signaling that the URN is not valid', () => {
        expect(() => getCollectionThirdParty(state, collection)).toThrowError('URN is not a third party URN')
      })
    })

    describe('and the collection has a valid URN', () => {
      beforeEach(() => {
        collection = {
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:one-third-party-collection'
        } as Collection
      })

      it('should return the third party that matches the given id', () => {
        expect(getCollectionThirdParty(state, collection)).toEqual(thirdParty2)
      })
    })
  })

  describe('when getting the third party of an item', () => {
    let state: RootState
    let item: any

    beforeEach(() => {
      state = {
        ...baseState,
        thirdParty: {
          ...baseState.thirdParty,
          data: {
            [thirdParty1.id]: thirdParty1,
            [thirdParty2.id]: thirdParty2,
            [thirdParty3.id]: thirdParty3
          }
        }
      }
    })

    describe("and the item doesn't have a valid third party URN", () => {
      beforeEach(() => {
        item = {
          urn: 'urn:decentraland:goerli:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'
        } as any
      })

      it('should throw with an error signaling that the URN is not valid', () => {
        expect(() => getItemThirdParty(state, item)).toThrowError('URN is not a third party URN')
      })
    })

    describe("and the item doesn't have an URN", () => {
      beforeEach(() => {
        item = {
          urn: null
        } as any
      })

      it('should return a nulled third party', () => {
        expect(getItemThirdParty(state, item)).toEqual(null)
      })
    })

    describe('and the item has a valid URN', () => {
      beforeEach(() => {
        item = {
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:one-third-party-collection'
        } as any
      })

      it('should return the third party that matches the given id', () => {
        expect(getItemThirdParty(state, item)).toEqual(thirdParty2)
      })
    })
  })

  describe('when getting if a batched set of third party items is being deployed', () => {
    let state: RootState

    describe('when the batched items are being deployed', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [{ type: DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST }]
          }
        }
      })

      it('should return true', () => {
        expect(isDeployingBatchedThirdPartyItems(state)).toBe(true)
      })
    })

    describe('when the batched items are not being deployed', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isDeployingBatchedThirdPartyItems(state)).toBe(false)
      })
    })
  })
})
