import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Land } from 'modules/land/types'
import { ENSData } from './types'
import {ENSError} from './reducer';

export const SET_ENS_RESOLVER_REQUEST = '[Request] Set ENS Resolver'
export const SET_ENS_RESOLVER_SUCCESS = '[Success] Set ENS Resolver'
export const SET_ENS_RESOLVER_FAILURE = '[Failure] Set ENS Resolver'

export const setENSResolverRequest = (ens: string, land: Land) =>
  action(SET_ENS_RESOLVER_REQUEST, { ens, land })

export const setENSResolverSuccess = (ens: string, data: ENSData, txHash: string) =>
  action(SET_ENS_RESOLVER_SUCCESS, {
    ...buildTransactionPayload(txHash, { ens }),
    ens, data
  })

export const setENSResolverFailure = (ens: string, land: Land, error: ENSError) =>
  action(SET_ENS_RESOLVER_FAILURE, { ens, land, error })

export type SetENSResolverRequestAction = ReturnType<typeof setENSResolverRequest>
export type SetENSResolverSuccessAction = ReturnType<typeof setENSResolverSuccess>
export type SetENSResolverFailureAction = ReturnType<typeof setENSResolverFailure>

export const SET_ENS_CONTENT_REQUEST = '[Request] Set ENS Content'
export const SET_ENS_CONTENT_SUCCESS = '[Success] Set ENS Content'
export const SET_ENS_CONTENT_FAILURE = '[Failure] Set ENS Content'

export const setENSContentRequest = (ens: string, land: Land) =>
  action(SET_ENS_CONTENT_REQUEST, { ens, land })

export const setENSContentSuccess = (ens: string, data: ENSData, txHash: string) =>
  action(SET_ENS_CONTENT_SUCCESS, {
    ...buildTransactionPayload(txHash, { ens }),
    ens, data
  })

export const setENSContentFailure = (ens: string, land: Land, error: ENSError) =>
  action(SET_ENS_CONTENT_FAILURE, { ens, land, error })

export type SetENSContentRequestAction = ReturnType<typeof setENSContentRequest>
export type SetENSContentSuccessAction = ReturnType<typeof setENSContentSuccess>
export type SetENSContentFailureAction = ReturnType<typeof setENSContentFailure>

export const GET_ENS_REQUEST = '[Request] Get ENS'
export const GET_ENS_SUCCESS = '[Success] Get ENS'
export const GET_ENS_FAILURE = '[Failure] Get ENS'

export const getENSRequest = (ens: string, land: Land) =>
  action(GET_ENS_REQUEST, { ens, land })

export const getENSSuccess = (ens: string, data: ENSData) =>
  action(GET_ENS_SUCCESS, { ens, data })

export const getENSFailure = (error: ENSError) =>
  action(GET_ENS_FAILURE, { error })

export type GetENSRequestAction = ReturnType<typeof getENSRequest>
export type GetENSSuccessAction = ReturnType<typeof getENSSuccess>
export type GetENSFailureAction = ReturnType<typeof getENSFailure>

export const GET_DOMAINLIST_REQUEST = '[Request] Get Domain List'
export const GET_DOMAINLIST_SUCCESS = '[Success] Get Domain List'
export const GET_DOMAINLIST_FAILURE = '[Failure] Get Domain List'

export const getDomainListRequest = () =>
  action(GET_DOMAINLIST_REQUEST, { })

export const getDomainListSuccess = (data: string[]) =>
  action(GET_DOMAINLIST_SUCCESS, { data })

export const getDomainListFailure = (error: ENSError) =>
  action(GET_DOMAINLIST_FAILURE, { error })

export type GetDomainListRequestAction = ReturnType<typeof getDomainListRequest>
export type GetDomainListSuccessAction = ReturnType<typeof getDomainListSuccess>
export type GetDomainListFailureAction = ReturnType<typeof getDomainListFailure>
