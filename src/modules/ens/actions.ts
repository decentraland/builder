import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Land } from 'modules/land/types'
import { ENSData } from './types'
import { ENSError } from './reducer'

// Set the ENS Resolver
export const SET_ENS_RESOLVER_REQUEST = '[Request] Set ENS Resolver'
export const SET_ENS_RESOLVER_SUCCESS = '[Success] Set ENS Resolver'
export const SET_ENS_RESOLVER_FAILURE = '[Failure] Set ENS Resolver'

export const setENSResolverRequest = (ens: string, land: Land) => action(SET_ENS_RESOLVER_REQUEST, { ens, land })

export const setENSResolverSuccess = (ens: string, address: string, data: ENSData, txHash: string) =>
  action(SET_ENS_RESOLVER_SUCCESS, {
    ...buildTransactionPayload(txHash, { ens, address }),
    ens,
    data
  })

export const setENSResolverFailure = (ens: string, land: Land, error: ENSError) => action(SET_ENS_RESOLVER_FAILURE, { ens, land, error })

export type SetENSResolverRequestAction = ReturnType<typeof setENSResolverRequest>
export type SetENSResolverSuccessAction = ReturnType<typeof setENSResolverSuccess>
export type SetENSResolverFailureAction = ReturnType<typeof setENSResolverFailure>

// Set the Content on ENS resolver contract.
// The Content is a IPFS hash refering a file. This file is an HTML file with a Redirection to a LAND url.
export const SET_ENS_CONTENT_REQUEST = '[Request] Set ENS Content'
export const SET_ENS_CONTENT_SUCCESS = '[Success] Set ENS Content'
export const SET_ENS_CONTENT_FAILURE = '[Failure] Set ENS Content'

export const setENSContentRequest = (ens: string, land: Land) => action(SET_ENS_CONTENT_REQUEST, { ens, land })

export const setENSContentSuccess = (ens: string, address: string, data: ENSData, txHash: string) =>
  action(SET_ENS_CONTENT_SUCCESS, {
    ...buildTransactionPayload(txHash, { ens, address }),
    ens,
    data
  })

export const setENSContentFailure = (ens: string, land: Land, error: ENSError) => action(SET_ENS_CONTENT_FAILURE, { ens, land, error })

export type SetENSContentRequestAction = ReturnType<typeof setENSContentRequest>
export type SetENSContentSuccessAction = ReturnType<typeof setENSContentSuccess>
export type SetENSContentFailureAction = ReturnType<typeof setENSContentFailure>

// Fetch ENS resolver for a land
export const FETCH_ENS_REQUEST = '[Request] Fetch ENS'
export const FETCH_ENS_SUCCESS = '[Success] Fetch ENS'
export const FETCH_ENS_FAILURE = '[Failure] Fetch ENS'

export const fetchENSRequest = (ens: string, land: Land) => action(FETCH_ENS_REQUEST, { ens, land })

export const fetchENSSuccess = (ens: string, data: ENSData) => action(FETCH_ENS_SUCCESS, { ens, data })

export const fetchENSFailure = (error: ENSError) => action(FETCH_ENS_FAILURE, { error })

export type FetchENSRequestAction = ReturnType<typeof fetchENSRequest>
export type FetchENSSuccessAction = ReturnType<typeof fetchENSSuccess>
export type FetchENSFailureAction = ReturnType<typeof fetchENSFailure>

// Get a Domain List (list of names) owned by the current account
export const FETCH_DOMAIN_LIST_REQUEST = '[Request] Fetch Domain List'
export const FETCH_DOMAIN_LIST_SUCCESS = '[Success] Fetch Domain List'
export const FETCH_DOMAIN_LIST_FAILURE = '[Failure] Fetch Domain List'

export const fetchDomainListRequest = () => action(FETCH_DOMAIN_LIST_REQUEST, {})

export const fetchDomainListSuccess = (data: string[]) => action(FETCH_DOMAIN_LIST_SUCCESS, { data })

export const fetchDomainListFailure = (error: ENSError) => action(FETCH_DOMAIN_LIST_FAILURE, { error })

export type FetchDomainListRequestAction = ReturnType<typeof fetchDomainListRequest>
export type FetchDomainListSuccessAction = ReturnType<typeof fetchDomainListSuccess>
export type FetchDomainListFailureAction = ReturnType<typeof fetchDomainListFailure>
