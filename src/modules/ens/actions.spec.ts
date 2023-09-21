import {
  fetchExternalENSNamesRequest,
  FETCH_EXTERNAL_ENS_NAMES_REQUEST,
  FETCH_EXTERNAL_ENS_NAMES_SUCCESS,
  fetchExternalENSNamesSuccess,
  fetchExternalENSNamesFailure,
  FETCH_EXTERNAL_ENS_NAMES_FAILURE
} from './actions'
import { ENSError } from './types'

let owner: string
let names: string[]
let error: ENSError

beforeEach(() => {
  owner = '0x123'
  names = ['name1.eth', 'name2.eth']
  error = { message: 'Some Error' }
})

describe('when creating the action that signals the start of an external ens fetch request', () => {
  it('should return an action signaling the start of an external ens fetch request', () => {
    expect(fetchExternalENSNamesRequest(owner)).toEqual({ type: FETCH_EXTERNAL_ENS_NAMES_REQUEST, payload: { owner } })
  })
})

describe('when creating the action that signals the successful fetch of external ens names', () => {
  it('should return an action signaling the successful fetch of external ens names', () => {
    expect(fetchExternalENSNamesSuccess(owner, names)).toEqual({ type: FETCH_EXTERNAL_ENS_NAMES_SUCCESS, payload: { owner, names } })
  })
})

describe('when creating the action that signals the unsuccessful fetch of external ens names', () => {
  it('should return an action signaling the unsuccessful fetch of external ens names', () => {
    expect(fetchExternalENSNamesFailure(owner, error)).toEqual({ type: FETCH_EXTERNAL_ENS_NAMES_FAILURE, payload: { owner, error } })
  })
})
