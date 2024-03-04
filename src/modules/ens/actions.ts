import { action } from 'typesafe-actions'
import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Land } from 'modules/land/types'
import { ENS, ENSError } from './types'

// Fetch ENS resolver for a land
export const FETCH_ENS_REQUEST = '[Request] Fetch ENS'
export const FETCH_ENS_SUCCESS = '[Success] Fetch ENS'
export const FETCH_ENS_FAILURE = '[Failure] Fetch ENS'

export const fetchENSRequest = (name: string, land?: Land) => action(FETCH_ENS_REQUEST, { name, land })
export const fetchENSSuccess = (ens: ENS) => action(FETCH_ENS_SUCCESS, { ens })
export const fetchENSFailure = (error: ENSError) => action(FETCH_ENS_FAILURE, { error })

export type FetchENSRequestAction = ReturnType<typeof fetchENSRequest>
export type FetchENSSuccessAction = ReturnType<typeof fetchENSSuccess>
export type FetchENSFailureAction = ReturnType<typeof fetchENSFailure>

// Fetch World Status for a ENS
export const FETCH_ENS_WORLD_STATUS_REQUEST = '[Request] Fetch ENS World Status'
export const FETCH_ENS_WORLD_STATUS_SUCCESS = '[Success] Fetch ENS World Status'
export const FETCH_ENS_WORLD_STATUS_FAILURE = '[Failure] Fetch ENS World Status'

export const fetchENSWorldStatusRequest = (subdomain: string) => action(FETCH_ENS_WORLD_STATUS_REQUEST, { subdomain })
export const fetchENSWorldStatusSuccess = (ens: ENS) => action(FETCH_ENS_WORLD_STATUS_SUCCESS, { ens })
export const fetchENSWorldStatusFailure = (error: ENSError) => action(FETCH_ENS_WORLD_STATUS_FAILURE, { error })

export type FetchENSWorldStatusRequestAction = ReturnType<typeof fetchENSWorldStatusRequest>
export type FetchENSWorldStatusSuccessAction = ReturnType<typeof fetchENSWorldStatusSuccess>
export type FetchENSWorldStatusFailureAction = ReturnType<typeof fetchENSWorldStatusFailure>

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

// set address to ens
export const SET_ENS_ADDRESS_REQUEST = '[Request] Set ENS Address'
export const SET_ENS_ADDRESS_SUCCESS = '[Success] Set ENS Address'
export const SET_ENS_ADDRESS_FAILURE = '[Failure] Set ENS Address'

export const setENSAddressRequest = (ens: ENS, address: string) => action(SET_ENS_ADDRESS_REQUEST, { ens, address })
export const setENSAddressSuccess = (ens: ENS, address: string, chainId: ChainId, txHash: string) =>
  action(SET_ENS_ADDRESS_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash, { ens, address }),
    ens,
    address
  })
export const setENSAddressFailure = (ens: ENS, address: string, error: ENSError) => action(SET_ENS_ADDRESS_FAILURE, { ens, address, error })

export type SetENSAddressRequestAction = ReturnType<typeof setENSAddressRequest>
export type SetENSAddressSuccessAction = ReturnType<typeof setENSAddressSuccess>
export type SetENSAddressFailureAction = ReturnType<typeof setENSAddressFailure>

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

// Reclaim ENS name
export const RECLAIM_NAME_REQUEST = '[Request] Reclaim Name'
export const RECLAIM_NAME_SUCCESS = '[Success] Reclaim Name'
export const RECLAIM_NAME_FAILURE = '[Failure] Reclaim Name'

export const reclaimNameRequest = (ens: ENS) => action(RECLAIM_NAME_REQUEST, { ens })
export const reclaimNameSuccess = (txHash: string, chainId: number, ens: ENS) =>
  action(RECLAIM_NAME_SUCCESS, { ...buildTransactionPayload(chainId, txHash, { ens }), ens })
export const reclaimNameFailure = (error: ENSError) => action(RECLAIM_NAME_FAILURE, { error })

export type ReclaimNameRequestAction = ReturnType<typeof reclaimNameRequest>
export type ReclaimNameSuccessAction = ReturnType<typeof reclaimNameSuccess>
export type ReclaimNameFailureAction = ReturnType<typeof reclaimNameFailure>

// Fetch non dcl ENS names
export const FETCH_EXTERNAL_NAMES_REQUEST = '[Request] Fetch External Names'
export const FETCH_EXTERNAL_NAMES_SUCCESS = '[Success] Fetch External Names'
export const FETCH_EXTERNAL_NAMES_FAILURE = '[Failure] Fetch External Names'

export const fetchExternalNamesRequest = (owner: string) => action(FETCH_EXTERNAL_NAMES_REQUEST, { owner })
export const fetchExternalNamesSuccess = (owner: string, names: ENS[]) => action(FETCH_EXTERNAL_NAMES_SUCCESS, { owner, names })
export const fetchExternalNamesFailure = (owner: string, error: ENSError) => action(FETCH_EXTERNAL_NAMES_FAILURE, { owner, error })

export type FetchExternalNamesRequestAction = ReturnType<typeof fetchExternalNamesRequest>
export type FetchExternalNamesSuccessAction = ReturnType<typeof fetchExternalNamesSuccess>
export type FetchExternalNamesFailureAction = ReturnType<typeof fetchExternalNamesFailure>

export const CLEAR_ENS_ERRORS = '[Clear] ENS errors'
export const clearENSErrors = () => action(CLEAR_ENS_ERRORS)
export type ClearENSErrorsAction = ReturnType<typeof clearENSErrors>

// Legacy claim name and name allowance actions left here to avoid breaking the activity feed
export const ALLOW_CLAIM_MANA_SUCCESS = '[Success] Allow Claim MANA'
export const CLAIM_NAME_TRANSACTION_SUBMITTED = '[Submitted] Claim Name'
