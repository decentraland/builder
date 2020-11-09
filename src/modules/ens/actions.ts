import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Land } from 'modules/land/types'
import { ENS, ENSError } from './types'

// Fetch ENS resolver for a land
export const FETCH_ENS_REQUEST = '[Request] Fetch ENS'
export const FETCH_ENS_SUCCESS = '[Success] Fetch ENS'
export const FETCH_ENS_FAILURE = '[Failure] Fetch ENS'

export const fetchENSRequest = (subdomain: string, land: Land) => action(FETCH_ENS_REQUEST, { subdomain, land })
export const fetchENSSuccess = (ens: ENS) => action(FETCH_ENS_SUCCESS, { ens })
export const fetchENSFailure = (error: ENSError) => action(FETCH_ENS_FAILURE, { error })

export type FetchENSRequestAction = ReturnType<typeof fetchENSRequest>
export type FetchENSSuccessAction = ReturnType<typeof fetchENSSuccess>
export type FetchENSFailureAction = ReturnType<typeof fetchENSFailure>

// Set the ENS Resolver
export const SET_ENS_RESOLVER_REQUEST = '[Request] Set ENS Resolver'
export const SET_ENS_RESOLVER_SUCCESS = '[Success] Set ENS Resolver'
export const SET_ENS_RESOLVER_FAILURE = '[Failure] Set ENS Resolver'

export const setENSResolverRequest = (subdomain: string) => action(SET_ENS_RESOLVER_REQUEST, { subdomain })
export const setENSResolverSuccess = (subdomain: string, resolver: string, address: string, txHash: string) =>
  action(SET_ENS_RESOLVER_SUCCESS, {
    ...buildTransactionPayload(txHash, { subdomain, resolver, address }),
    subdomain
  })
export const setENSResolverFailure = (subdomain: string, error: ENSError) => action(SET_ENS_RESOLVER_FAILURE, { subdomain, error })

export type SetENSResolverRequestAction = ReturnType<typeof setENSResolverRequest>
export type SetENSResolverSuccessAction = ReturnType<typeof setENSResolverSuccess>
export type SetENSResolverFailureAction = ReturnType<typeof setENSResolverFailure>

// Set the Content on ENS resolver contract.
// The Content is a IPFS hash refering a file. This file is an HTML file with a Redirection to a LAND url.
export const SET_ENS_CONTENT_REQUEST = '[Request] Set ENS Content'
export const SET_ENS_CONTENT_SUCCESS = '[Success] Set ENS Content'
export const SET_ENS_CONTENT_FAILURE = '[Failure] Set ENS Content'

export const setENSContentRequest = (subdomain: string, land: Land) => action(SET_ENS_CONTENT_REQUEST, { subdomain, land })
export const setENSContentSuccess = (subdomain: string, content: string, land: Land, address: string, txHash: string) =>
  action(SET_ENS_CONTENT_SUCCESS, {
    ...buildTransactionPayload(txHash, { subdomain, content, land, address }),
    subdomain,
    land
  })
export const setENSContentFailure = (subdomain: string, land: Land, error: ENSError) =>
  action(SET_ENS_CONTENT_FAILURE, { subdomain, land, error })

export type SetENSContentRequestAction = ReturnType<typeof setENSContentRequest>
export type SetENSContentSuccessAction = ReturnType<typeof setENSContentSuccess>
export type SetENSContentFailureAction = ReturnType<typeof setENSContentFailure>

// Get a ENS List (list of names) owned by the current account
export const FETCH_ENS_LIST_REQUEST = '[Request] Fetch ENS List'
export const FETCH_ENS_LIST_SUCCESS = '[Success] Fetch ENS List'
export const FETCH_ENS_LIST_FAILURE = '[Failure] Fetch ENS List'

export const fetchENSListRequest = () => action(FETCH_ENS_LIST_REQUEST, {})
export const fetchENSListSuccess = (ensList: ENS[]) => action(FETCH_ENS_LIST_SUCCESS, { ensList })
export const fetchENSListFailure = (error: ENSError) => action(FETCH_ENS_LIST_FAILURE, { error })

export type FetchENSListRequestAction = ReturnType<typeof fetchENSListRequest>
export type FetchENSListSuccessAction = ReturnType<typeof fetchENSListSuccess>
export type FetchENSListFailureAction = ReturnType<typeof fetchENSListFailure>
