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
    'name1.eth': {
      domain: 'name1.eth',
      nftOwnerAddress: wallet
    },
    'name2.eth': {
      domain: 'name2.eth',
      nftOwnerAddress: wallet
    },
    'name3.eth': {
      domain: 'name2.eth',
      nftOwnerAddress: '0xOtherWallet'
    }
  } as unknown as ENSState['externalNames']
})

describe('when getting the external names', () => {
  beforeEach(() => {
    state = {
      ens: {
        externalNames
      } as ENSState
    } as RootState
  })

  it('should return a record of external names by domain', () => {
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
      expect(getExternalNamesForConnectedWallet(state)).toEqual([
        {
          domain: 'name1.eth',
          nftOwnerAddress: wallet
        },
        {
          domain: 'name2.eth',
          nftOwnerAddress: wallet
        }
      ])
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
