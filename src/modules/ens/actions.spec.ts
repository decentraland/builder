import {
  fetchExternalNamesRequest,
  FETCH_EXTERNAL_NAMES_REQUEST,
  FETCH_EXTERNAL_NAMES_SUCCESS,
  fetchExternalNamesSuccess,
  fetchExternalNamesFailure,
  FETCH_EXTERNAL_NAMES_FAILURE
} from './actions'
import { ENS, ENSError } from './types'

let owner: string
let names: ENS[]
let error: ENSError

beforeEach(() => {
  owner = '0x123'
  names = [{}, {}] as ENS[]
  error = { message: 'Some Error' }
})

describe('when creating the action that signals the start of an external names fetch request', () => {
  it('should return an action signaling the start of an external names fetch request', () => {
    expect(fetchExternalNamesRequest(owner)).toEqual({ type: FETCH_EXTERNAL_NAMES_REQUEST, payload: { owner } })
  })
})

describe('when creating the action that signals the successful fetch of external names', () => {
  it('should return an action signaling the successful fetch of external names', () => {
    expect(fetchExternalNamesSuccess(owner, names)).toEqual({ type: FETCH_EXTERNAL_NAMES_SUCCESS, payload: { owner, names } })
  })
})

describe('when creating the action that signals the unsuccessful fetch of external names', () => {
  it('should return an action signaling the unsuccessful fetch of external names', () => {
    expect(fetchExternalNamesFailure(owner, error)).toEqual({ type: FETCH_EXTERNAL_NAMES_FAILURE, payload: { owner, error } })
  })
})
