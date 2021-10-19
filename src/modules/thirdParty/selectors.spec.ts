import { RootState } from 'modules/common/types'
import { isManager, getWalletThirdParties } from './selectors'
import { ThirdParty } from './types'

describe('Third Party selectors', () => {
  let address: string
  let baseState: RootState

  beforeEach(() => {
    address = '0xdeabeef'
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
        expect(isManager(state)).toBe(true)
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
        expect(isManager(state)).toBe(false)
      })
    })

    describe('when getting the wallet third parties', () => {
      let state: RootState
      let thirdParties: ThirdParty[]

      beforeEach(() => {
        const thirdParty1 = { id: '1', name: 'a third party', description: 'some desc', managers: [address, '0xa'] } as ThirdParty
        const thirdParty2 = { id: '2', name: 'a third party', description: 'some desc', managers: [address, '0xb'] } as ThirdParty
        const thirdParty3 = { id: '3', name: 'a third party', description: 'some desc', managers: ['0xc'] } as ThirdParty

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
  })
})
