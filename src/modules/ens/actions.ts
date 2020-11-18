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

export const setENSResolverRequest = (ens: ENS) => action(SET_ENS_RESOLVER_REQUEST, { ens })
export const setENSResolverSuccess = (ens: ENS, resolver: string, address: string, txHash: string) =>
  action(SET_ENS_RESOLVER_SUCCESS, {
    ...buildTransactionPayload(txHash, { ens, resolver, address }),
    ens
  })
export const setENSResolverFailure = (ens: ENS, error: ENSError) => action(SET_ENS_RESOLVER_FAILURE, { ens, error })

export type SetENSResolverRequestAction = ReturnType<typeof setENSResolverRequest>
export type SetENSResolverSuccessAction = ReturnType<typeof setENSResolverSuccess>
export type SetENSResolverFailureAction = ReturnType<typeof setENSResolverFailure>

// Set the Content on the ENS resolver contract.
// The Content is a IPFS hash refering a file. This file is an HTML file with a Redirection to a LAND url.
export const SET_ENS_CONTENT_REQUEST = '[Request] Set ENS Content'
export const SET_ENS_CONTENT_SUCCESS = '[Success] Set ENS Content'
export const SET_ENS_CONTENT_FAILURE = '[Failure] Set ENS Content'

export const setENSContentRequest = (ens: ENS, land?: Land) => action(SET_ENS_CONTENT_REQUEST, { ens, land })
export const setENSContentSuccess = (ens: ENS, content: string, land: Land | undefined, address: string, txHash: string) =>
  action(SET_ENS_CONTENT_SUCCESS, {
    ...buildTransactionPayload(txHash, { ens, content, land, address }),
    ens,
    land
  })
export const setENSContentFailure = (ens: ENS, land: Land | undefined, error: ENSError) =>
  action(SET_ENS_CONTENT_FAILURE, { ens, land, error })

export type SetENSContentRequestAction = ReturnType<typeof setENSContentRequest>
export type SetENSContentSuccessAction = ReturnType<typeof setENSContentSuccess>
export type SetENSContentFailureAction = ReturnType<typeof setENSContentFailure>

// Get a Domain List (list of names) owned by the current account
export const FETCH_DOMAIN_LIST_REQUEST = '[Request] Fetch Domain List'
export const FETCH_DOMAIN_LIST_SUCCESS = '[Success] Fetch Domain List'
export const FETCH_DOMAIN_LIST_FAILURE = '[Failure] Fetch Domain List'

export const fetchDomainListRequest = () => action(FETCH_DOMAIN_LIST_REQUEST, {})
export const fetchDomainListSuccess = (ensList: ENS[]) => action(FETCH_DOMAIN_LIST_SUCCESS, { ensList })
export const fetchDomainListFailure = (error: ENSError) => action(FETCH_DOMAIN_LIST_FAILURE, { error })

export type FetchDomainListRequestAction = ReturnType<typeof fetchDomainListRequest>
export type FetchDomainListSuccessAction = ReturnType<typeof fetchDomainListSuccess>
export type FetchDomainListFailureAction = ReturnType<typeof fetchDomainListFailure>

// Claim a new name
export const CLAIM_NAME_REQUEST = '[Request] Claim Name'
export const CLAIM_NAME_SUCCESS = '[Success] Claim Name'
export const CLAIM_NAME_FAILURE = '[Failure] Claim Name'

export const claimNameRequest = (ens: ENS, name: string) => action(CLAIM_NAME_REQUEST, { ens, name })
export const claimNameSuccess = (ens: ENS, name: string, address: string, txHash: string) =>
  action(CLAIM_NAME_SUCCESS, {
    ...buildTransactionPayload(txHash, { ens, name, address }),
    ens,
    name
  })
export const claimNameFailure = (error: ENSError) => action(CLAIM_NAME_FAILURE, { error })

export type ClaimNameRequestAction = ReturnType<typeof claimNameRequest>
export type ClaimNameSuccessAction = ReturnType<typeof claimNameSuccess>
export type ClaimNameFailureAction = ReturnType<typeof claimNameFailure>
