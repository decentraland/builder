import { RootState } from 'modules/common/types'
import { TransactionState } from 'decentraland-dapps/dist/modules/transaction/reducer'
import { Transaction, TransactionStatus } from 'decentraland-dapps/dist/modules/transaction/types'
import {
  getContributableNames,
  getContributableNamesError,
  getExternalNames,
  getExternalNamesForConnectedWallet,
  getExternalNamesForWallet,
  isWaitingTxSetAddress
} from './selectors'
import { ENSState } from './reducer'
import { SET_ENS_ADDRESS_SUCCESS, SET_ENS_CONTENT_SUCCESS } from './actions'
import { ENS } from './types'

let state: RootState
let wallet1: string
let wallet2: string
let externalNames: ENSState['externalNames']

beforeEach(() => {
  wallet1 = '0x123'
  wallet2 = '0x456'
  externalNames = {
    'name1.eth': {
      domain: 'name1.eth',
      nftOwnerAddress: wallet1
    },
    'name2.eth': {
      domain: 'name2.eth',
      nftOwnerAddress: wallet1
    },
    'name3.eth': {
      domain: 'name3.eth',
      nftOwnerAddress: wallet2
    }
  } as unknown as ENSState['externalNames']

  state = {
    ens: {
      externalNames
    },
    wallet: {
      data: {
        address: wallet1
      }
    }
  } as RootState
})

describe('when getting the external names', () => {
  it('should return a record of external names by domain', () => {
    expect(getExternalNames(state)).toEqual(externalNames)
  })
})

describe('when getting the external names for the connected wallet', () => {
  describe('when there is a connected wallet', () => {
    describe('when the external names has an entry for the connected wallet', () => {
      it('should return the names of the wallet', () => {
        expect(getExternalNamesForConnectedWallet(state)).toEqual([
          {
            domain: 'name1.eth',
            nftOwnerAddress: wallet1
          },
          {
            domain: 'name2.eth',
            nftOwnerAddress: wallet1
          }
        ])
      })
    })

    describe('when the external names does not have an entry for the connected wallet', () => {
      beforeEach(() => {
        state.ens.externalNames = {}
      })

      it('should return an empty array', () => {
        expect(getExternalNamesForConnectedWallet(state)).toEqual([])
      })
    })
  })

  describe('when there is no connected wallet', () => {
    beforeEach(() => {
      state.wallet.data && (state.wallet.data = null)
    })

    it('should return an empty array', () => {
      expect(getExternalNamesForConnectedWallet(state)).toEqual([])
    })
  })
})

describe('when getting the external names for a provided wallet', () => {
  describe('when getting the names for wallet1', () => {
    it('should return the external names of wallet1', () => {
      expect(getExternalNamesForWallet(wallet1)(state)).toEqual([
        {
          domain: 'name1.eth',
          nftOwnerAddress: wallet1
        },
        {
          domain: 'name2.eth',
          nftOwnerAddress: wallet1
        }
      ])
    })
  })

  describe('when getting the names for wallet2', () => {
    it('should return the external names of wallet2', () => {
      expect(getExternalNamesForWallet(wallet2)(state)).toEqual([
        {
          domain: 'name3.eth',
          nftOwnerAddress: wallet2
        }
      ])
    })
  })
})

describe('when using isWaitingTxSetAddress selector', () => {
  describe('and there are no pending transactions', () => {
    beforeEach(() => {
      state = {
        transaction: { data: [], loading: [], error: null } as TransactionState,
        wallet: {
          data: {
            address: wallet1
          }
        }
      } as RootState
    })
    it('should return false', () => {
      expect(isWaitingTxSetAddress(state)).toEqual(false)
    })
  })

  describe('and there are pending transactions', () => {
    describe('and the transaction actionType is SET_ENS_ADDRESS_SUCCESS', () => {
      beforeEach(() => {
        state = {
          transaction: {
            data: [
              {
                actionType: SET_ENS_ADDRESS_SUCCESS,
                status: TransactionStatus.PENDING,
                from: wallet1
              } as Transaction
            ],
            loading: [],
            error: null
          } as TransactionState,
          wallet: {
            data: {
              address: wallet1
            }
          }
        } as RootState
      })
      it('should return true', () => {
        expect(isWaitingTxSetAddress(state)).toEqual(true)
      })
    })

    describe('and the transaction actionType is not SET_ENS_ADDRESS_SUCCESS', () => {
      beforeEach(() => {
        state = {
          transaction: {
            data: [
              {
                actionType: SET_ENS_CONTENT_SUCCESS,
                status: TransactionStatus.PENDING,
                from: wallet1
              } as Transaction
            ],
            loading: [],
            error: null
          } as TransactionState,
          wallet: {
            data: {
              address: wallet1
            }
          }
        } as RootState
      })
      it('should return false', () => {
        expect(isWaitingTxSetAddress(state)).toEqual(false)
      })
    })
  })
})

describe('when using getContributableNames selector', () => {
  let contributableNames: ENSState['contributableNames']
  beforeEach(() => {
    contributableNames = {
      'test.dcl.eth': {
        name: 'test.dcl.eth'
      } as ENS,
      'test2.eth': {
        name: 'test2.eth'
      } as ENS
    }
    state = {
      ...state,
      ens: {
        ...state.ens,
        contributableNames
      }
    }
  })

  it('should return a record of contributable names', () => {
    expect(getContributableNames(state)).toEqual(contributableNames)
  })
})

describe('when using getContributableNamesError selector', () => {
  let contributableNamesError: ENSState['contributableNamesError']
  describe('when there was an error laoding the contributable names', () => {
    beforeEach(() => {
      contributableNamesError = { message: 'Test error' }
      state = {
        ...state,
        ens: {
          ...state.ens,
          contributableNamesError
        }
      }
    })

    it('should return a record of contributable names', () => {
      expect(getContributableNamesError(state)).toEqual(contributableNamesError)
    })
  })

  describe('when the contributable names were loaded successfully', () => {
    beforeEach(() => {
      contributableNamesError = null
      state = {
        ...state,
        ens: {
          ...state.ens,
          contributableNamesError
        }
      }
    })

    it('should return a record of contributable names', () => {
      expect(getContributableNamesError(state)).toEqual(contributableNamesError)
    })
  })
})
