import { WalletState } from 'decentraland-dapps/dist/modules/wallet/reducer'
import { RootState } from 'modules/common/types'
import { getExternalNames, getExternalNamesForConnectedWallet } from './selectors'
import { ENSState } from './reducer'

let state: RootState
let wallet: string
let externalNames: ENSState['externalNames']

beforeEach(() => {
  state = {} as RootState
  wallet = '0x123'
  externalNames = {
    [wallet]: ['name1.eth', 'name2.eth']
  }
})

describe('when getting the external names', () => {
  beforeEach(() => {
    state = {
      ens: {
        externalNames
      } as ENSState
    } as RootState
  })

  it('should return a record of names by address', () => {
    expect(getExternalNames(state)).toEqual(externalNames)
  })
})

describe('when getting the external names by wallet', () => {
  describe('when the external names has an entry for the wallet', () => {
    beforeEach(() => {
      state = {
        ens: {
          externalNames
        } as ENSState,
        wallet: {
          data: {
            address: wallet
          }
        } as WalletState
      } as RootState
    })

    it('should return the names of the wallet', () => {
      expect(getExternalNamesForConnectedWallet(state)).toEqual(externalNames[wallet])
    })
  })

  describe('when the external names does not have an entry for the wallet', () => {
    beforeEach(() => {
      state = {
        ens: {
          externalNames: {}
        } as ENSState,
        wallet: {
          data: {
            address: wallet
          }
        } as WalletState
      } as RootState
    })

    it('should return an empty array', () => {
      expect(getExternalNamesForConnectedWallet(state)).toEqual([])
    })
  })

  describe('when there is no wallet', () => {
    beforeEach(() => {
      state = {
        ens: {
          externalNames
        } as ENSState,
        wallet: {
          data: null
        } as WalletState
      } as RootState
    })

    it('should return an empty array', () => {
      expect(getExternalNamesForConnectedWallet(state)).toEqual([])
    })
  })
})
