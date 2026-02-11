import { ChainId } from '@dcl/schemas'
import {
  FETCH_EXTERNAL_NAMES_REQUEST,
  SET_ENS_ADDRESS_SUCCESS,
  clearENSErrors,
  fetchContributableNamesFailure,
  fetchContributableNamesRequest,
  fetchContributableNamesSuccess,
  fetchENSFailure,
  fetchENSListRequest,
  fetchENSRequest,
  fetchExternalNamesFailure,
  fetchExternalNamesRequest,
  fetchExternalNamesSuccess,
  setENSAddressFailure,
  setENSAddressRequest
} from './actions'
import { ENSState, INITIAL_STATE, ensReducer } from './reducer'
import { ENS, ENSError } from './types'
import { fetchTransactionSuccess } from 'decentraland-dapps/dist/modules/transaction/actions'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'

let state: ENSState

beforeEach(() => {
  state = { ...INITIAL_STATE }
})

describe('when handling the fetch external names actions', () => {
  let owner: string

  beforeEach(() => {
    owner = '0x123'
  })

  describe('when handling the fetch external names request action', () => {
    it('should add the fetch external names request action to the loading state', () => {
      const action = fetchExternalNamesRequest(owner)
      const newState = ensReducer(state, action)
      expect(newState.loading[0]).toEqual(action)
    })
  })

  describe('when handling the fetch external names failure action', () => {
    let error: ENSError

    beforeEach(() => {
      error = { message: 'Some Error' }
    })

    it('should set the error to the error state', () => {
      const action = fetchExternalNamesFailure(owner, error)
      const newState = ensReducer(state, action)
      expect(newState.error).toEqual(error)
    })

    it('should remove the fetch external names request action from the loading state', () => {
      const action = fetchExternalNamesFailure(owner, error)
      const newState = ensReducer(state, action)
      expect(newState.loading.length).toEqual(0)
    })
  })

  describe('when handling the fetch external names success action', () => {
    let names: ENS[]

    beforeEach(() => {
      names = [
        {
          subdomain: 'name1.eth',
          nftOwnerAddress: owner,
          name: 'name1.eth',
          content: '',
          ensOwnerAddress: '',
          resolver: '',
          tokenId: ''
        },
        {
          subdomain: 'name2.eth',
          nftOwnerAddress: owner,
          name: 'name2.eth',
          content: '',
          ensOwnerAddress: '',
          resolver: '',
          tokenId: ''
        }
      ]
      state.loading = [{ type: FETCH_EXTERNAL_NAMES_REQUEST }]
    })

    it('should update the external names property in the state', () => {
      const action = fetchExternalNamesSuccess(owner, names)
      const newState = ensReducer(state, action)
      expect(newState.externalNames).toEqual({
        'name1.eth': names[0],
        'name2.eth': names[1]
      })
    })

    it('should remove the fetch external names request action from the loading state', () => {
      const action = fetchExternalNamesSuccess(owner, names)
      const newState = ensReducer(state, action)
      expect(newState.loading.length).toEqual(0)
    })
  })
})

describe('when handling the fetch ENS actions', () => {
  let subdomain: string

  beforeEach(() => {
    subdomain = 'test.dcl.eth'
  })

  describe('when handling the fetch ENS request action', () => {
    it('should add the fetch ENS request action to the loading state', () => {
      const action = fetchENSRequest(subdomain)
      const newState = ensReducer(state, action)
      expect(newState.loading[0]).toEqual(action)
    })

    it('should clear both error and ensError', () => {
      const stateWithErrors = {
        ...state,
        error: { message: 'general error' },
        ensError: { message: 'fetch name error' }
      }
      const action = fetchENSRequest(subdomain)
      const newState = ensReducer(stateWithErrors, action)
      expect(newState.error).toEqual(null)
      expect(newState.ensError).toEqual(null)
    })
  })

  describe('when handling the fetch ENS failure action', () => {
    let error: ENSError

    beforeEach(() => {
      error = { message: 'ENS name does not exist' }
      state.loading = [fetchENSRequest(subdomain)]
    })

    it('should set both error and ensError to the error state', () => {
      const action = fetchENSFailure(error)
      const newState = ensReducer(state, action)
      expect(newState.error).toEqual(error)
      expect(newState.ensError).toEqual(error)
    })

    it('should remove the fetch ENS request action from the loading state', () => {
      const action = fetchENSFailure(error)
      const newState = ensReducer(state, action)
      expect(newState.loading.length).toEqual(0)
    })
  })

  describe('when handling the fetch ENS list request action', () => {
    it('should clear the general error but not ensError', () => {
      const stateWithErrors = {
        ...state,
        error: { message: 'general error' },
        ensError: { message: 'fetch name error' }
      }
      const action = fetchENSListRequest()
      const newState = ensReducer(stateWithErrors, action)
      expect(newState.error).toEqual(null)
      expect(newState.ensError).toEqual({ message: 'fetch name error' })
    })
  })
})

describe('when handling set ens address actions', () => {
  let ens: ENS
  let address: string

  beforeEach(() => {
    state = { ...INITIAL_STATE }
    address = '0xtest'
    ens = {
      name: 'test',
      subdomain: 'test.dcl.eth',
      nftOwnerAddress: address
    } as ENS
  })

  describe('when handling the set ens address request action', () => {
    it('should add the set ens address request action to the loading state', () => {
      const action = setENSAddressRequest(ens, address)
      const newState = ensReducer(state, action)
      expect(newState.loading[0]).toEqual(action)
    })

    it('should set the error as null', () => {
      const action = setENSAddressRequest(ens, address)
      const newState = ensReducer({ ...state, error: { message: 'some error' } }, action)
      expect(newState.error).toEqual(null)
    })
  })

  describe('when handling the set ens address failure action', () => {
    let error: ENSError
    beforeEach(() => {
      error = { message: 'some error' }
      state = {
        ...state,
        loading: [setENSAddressRequest(ens, address)]
      }
    })

    it('should remove the set ens address request action from the loading state', () => {
      const action = setENSAddressFailure(ens, address, error)
      const newState = ensReducer(state, action)
      expect(newState.loading.length).toEqual(0)
    })

    it('should add the error to the state', () => {
      const action = setENSAddressFailure(ens, address, error)
      const newState = ensReducer(state, action)
      expect(newState.error).toEqual(error)
    })
  })

  describe('when handling the set ens address success action', () => {
    let action: ReturnType<typeof fetchTransactionSuccess>
    beforeEach(() => {
      state = {
        ...state,
        data: {
          'test.dcl.eth': {
            subdomain: 'test.dcl.eth',
            name: 'test'
          } as ENS
        },
        error: { message: 'some error' },
        loading: [setENSAddressRequest(ens, address)]
      }

      action = fetchTransactionSuccess({
        actionType: SET_ENS_ADDRESS_SUCCESS,
        payload: { ens, address, chainId: ChainId.ETHEREUM_SEPOLIA, hash: 'hash' }
      } as Transaction)
    })

    it('should remove the set ens address request action from the loading state', () => {
      const newState = ensReducer(state, action)
      expect(newState.loading.length).toEqual(0)
    })

    it('should set the error as null', () => {
      const newState = ensReducer(state, action)
      expect(newState.error).toEqual(null)
    })

    it('should set the address to the subdomain', () => {
      const newState = ensReducer(state, action)
      expect(newState.data['test.dcl.eth'].ensAddressRecord).toEqual(address)
    })
  })
})

describe('when handling the CLEAR_ENS_ERRORS action', () => {
  it('should remove the existing error from the state', () => {
    const newState = ensReducer(
      {
        ...state,
        error: { message: 'some error' }
      },
      clearENSErrors()
    )
    expect(newState.error).toEqual(null)
  })
})

describe('when handling fetch contributable names actions', () => {
  describe('when handling fetch contributable names request action', () => {
    it('should reset the contributable names error', () => {
      const stateWithError = {
        ...state,
        contributableNamesError: { message: 'an error' }
      }
      expect(ensReducer(stateWithError, fetchContributableNamesRequest())).toEqual(
        expect.objectContaining({
          contributableNamesError: null
        })
      )
    })

    it('should set the contributable names action as loading', () => {
      const stateWithoutLoading = {
        ...state,
        loading: []
      }
      const action = fetchContributableNamesRequest()
      expect(ensReducer(stateWithoutLoading, fetchContributableNamesRequest())).toEqual(
        expect.objectContaining({
          loading: [action]
        })
      )
    })
  })

  describe('when handling fetch contributable names success action', () => {
    let ens: ENS
    beforeEach(() => {
      state = {
        ...state,
        loading: [fetchContributableNamesRequest()]
      }

      ens = { name: 'test.dcl.eth', subdomain: 'test.dcl.eth' } as ENS
    })

    it('should add the contributable names to the state', () => {
      expect(ensReducer(state, fetchContributableNamesSuccess([ens]))).toEqual(
        expect.objectContaining({
          contributableNames: { 'test.dcl.eth': ens }
        })
      )
    })

    it('should remove the loading action from the state', () => {
      expect(ensReducer(state, fetchContributableNamesSuccess([ens]))).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })
  })

  describe('when handling fetch contributable names failure action', () => {
    let error: ENSError
    beforeEach(() => {
      error = { message: 'Message' }
      state = {
        ...state,
        loading: [fetchContributableNamesRequest()]
      }
    })

    it('should add the error to the state', () => {
      expect(ensReducer(state, fetchContributableNamesFailure(error))).toEqual(
        expect.objectContaining({
          contributableNamesError: error
        })
      )
    })

    it('should reset loading', () => {
      expect(ensReducer(state, fetchContributableNamesFailure(error))).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })
  })
})
