import { FETCH_EXTERNAL_NAMES_REQUEST, fetchExternalNamesFailure, fetchExternalNamesRequest, fetchExternalNamesSuccess } from './actions'
import { ENSState, INITIAL_STATE, ensReducer } from './reducer'
import { ENSError } from './types'

let state: ENSState

beforeEach(() => {
  state = INITIAL_STATE
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
      const action = fetchExternalNamesFailure(error, owner)
      const newState = ensReducer(state, action)
      expect(newState.error).toEqual(error)
    })

    it('should remove the fetch external names request action from the loading state', () => {
      const action = fetchExternalNamesFailure(error, owner)
      const newState = ensReducer(state, action)
      expect(newState.loading.length).toEqual(0)
    })
  })

  describe('when handling the fetch external names success action', () => {
    let names: string[]

    beforeEach(() => {
      names = ['name1.eth', 'name2.eth']
      state.loading = [{ type: FETCH_EXTERNAL_NAMES_REQUEST }]
    })

    it('should update the external names property in the state', () => {
      const action = fetchExternalNamesSuccess(owner, names)
      const newState = ensReducer(state, action)
      expect(newState.externalNames[owner]).toEqual(names)
    })

    it('should remove the fetch external names request action from the loading state', () => {
      const action = fetchExternalNamesSuccess(owner, names)
      const newState = ensReducer(state, action)
      expect(newState.loading.length).toEqual(0)
    })
  })
})
