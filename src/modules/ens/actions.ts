import { action } from 'typesafe-actions'
import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Land } from 'modules/land/types'
import { Authorization, ENS, ENSError } from './types'

// Fetch ENS resolver for a land
export const FETCH_ENS_REQUEST = '[Request] Fetch ENS'
export const FETCH_ENS_SUCCESS = '[Success] Fetch ENS'
export const FETCH_ENS_FAILURE = '[Failure] Fetch ENS'

export const fetchENSRequest = (name: string, land: Land) => action(FETCH_ENS_REQUEST, { name, land })
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
export const setENSResolverSuccess = (ens: ENS, resolver: string, address: string, chainId: ChainId, txHash: string) =>
  action(SET_ENS_RESOLVER_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash, { ens, resolver, address }),
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
export const setENSContentSuccess = (
  ens: ENS,
  content: string,
  land: Land | undefined,
  address: string,
  chainId: ChainId,
  txHash: string
) =>
  action(SET_ENS_CONTENT_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash, { ens, content, land, address }),
    ens,
    land
  })
export const setENSContentFailure = (ens: ENS, land: Land | undefined, error: ENSError) =>
  action(SET_ENS_CONTENT_FAILURE, { ens, land, error })

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

// Set Alias
export const SET_ALIAS_REQUEST = '[Request] Set Alias'
export const SET_ALIAS_SUCCESS = '[Success] Set Alias'
export const SET_ALIAS_FAILURE = '[Failure] Set Alias'

export const setAliasRequest = (address: string, name: string) => action(SET_ALIAS_REQUEST, { address, name })
export const setAliasSuccess = (address: string, name: string) => action(SET_ALIAS_SUCCESS, { address, name })
export const setAliasFailure = (address: string, error: ENSError) => action(SET_ALIAS_FAILURE, { address, error })

export type SetAliasRequestAction = ReturnType<typeof setAliasRequest>
export type SetAliasSuccessAction = ReturnType<typeof setAliasSuccess>
export type SetAliasFailureAction = ReturnType<typeof setAliasFailure>

// Claim a new name
export const CLAIM_NAME_REQUEST = '[Request] Claim Name'
export const CLAIM_NAME_SUCCESS = '[Success] Claim Name'
export const CLAIM_NAME_FAILURE = '[Failure] Claim Name'

export const claimNameRequest = (name: string) => action(CLAIM_NAME_REQUEST, { name })
export const claimNameSuccess = (ens: ENS, name: string, address: string, chainId: ChainId, txHash: string) =>
  action(CLAIM_NAME_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash, { ens, name, address }),
    ens,
    name
  })
export const claimNameFailure = (error: ENSError) => action(CLAIM_NAME_FAILURE, { error })

export type ClaimNameRequestAction = ReturnType<typeof claimNameRequest>
export type ClaimNameSuccessAction = ReturnType<typeof claimNameSuccess>
export type ClaimNameFailureAction = ReturnType<typeof claimNameFailure>

// Fetch ENS related authorizations
export const FETCH_ENS_AUTHORIZATION_REQUEST = '[Request] Fetch ENS Authorization'
export const FETCH_ENS_AUTHORIZATION_SUCCESS = '[Success] Fetch ENS Authorization'
export const FETCH_ENS_AUTHORIZATION_FAILURE = '[Failure] Fetch ENS Authorization'

export const fetchENSAuthorizationRequest = () => action(FETCH_ENS_AUTHORIZATION_REQUEST, {})
export const fetchENSAuthorizationSuccess = (authorization: Authorization, address: string) =>
  action(FETCH_ENS_AUTHORIZATION_SUCCESS, { authorization, address })
export const fetchENSAuthorizationFailure = (error: ENSError) => action(FETCH_ENS_AUTHORIZATION_FAILURE, { error })

export type FetchENSAuthorizationRequestAction = ReturnType<typeof fetchENSAuthorizationRequest>
export type FetchENSAuthorizationSuccessAction = ReturnType<typeof fetchENSAuthorizationSuccess>
export type FetchENSAuthorizationFailureAction = ReturnType<typeof fetchENSAuthorizationFailure>

// Allow MANA to claim names
export const ALLOW_CLAIM_MANA_REQUEST = '[Request] Allow Claim MANA'
export const ALLOW_CLAIM_MANA_SUCCESS = '[Success] Allow Claim MANA'
export const ALLOW_CLAIM_MANA_FAILURE = '[Failure] Allow Claim MANA'

export const allowClaimManaRequest = (allowance: string) => action(ALLOW_CLAIM_MANA_REQUEST, { allowance })
export const allowClaimManaSuccess = (allowance: string, address: string, chainId: ChainId, txHash: string) =>
  action(ALLOW_CLAIM_MANA_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash, { allowance, address }),
    allowance,
    address
  })
export const allowClaimManaFailure = (error: ENSError) => action(ALLOW_CLAIM_MANA_FAILURE, { error })

export type AllowClaimManaRequestAction = ReturnType<typeof allowClaimManaRequest>
export type AllowClaimManaSuccessAction = ReturnType<typeof allowClaimManaSuccess>
export type AllowClaimManaFailureAction = ReturnType<typeof allowClaimManaFailure>
