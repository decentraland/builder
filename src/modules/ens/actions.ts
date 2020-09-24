import { action } from 'typesafe-actions'
import {Land} from 'modules/land/types';
import { ENSData } from './types'


export const GET_ENS_REQUEST = '[Request] Get ENS'
export const GET_ENS_SUCCESS = '[Success] Get ENS'
export const GET_ENS_FAILURE = '[Failure] Get ENS'

export const getENSRequest = (ens: string, land: Land) => 
  action(GET_ENS_REQUEST, { ens, land })

export const getENSSuccess = (ens: string, data: ENSData) =>
  action(GET_ENS_SUCCESS, { ens, data })

export const getENSFailure = (error: string) =>
  action(GET_ENS_FAILURE, { error })

export type GetENSRequestAction = ReturnType<typeof getENSRequest>
export type GetENSSuccessAction = ReturnType<typeof getENSSuccess>
export type GetENSFailureAction = ReturnType<typeof getENSFailure>


export const SET_ENS_REQUEST = '[Request] Set ENS'
export const SET_ENS_SUCCESS = '[Success] Set ENS'
export const SET_ENS_FAILURE = '[Failure] Set ENS'

export const setENSRequest = (ens: string, land: Land) => 
  action(SET_ENS_REQUEST, { ens, land })

export const setENSSuccess = (ens: string, data: ENSData) =>
  action(SET_ENS_SUCCESS, {ens, data })

export const setENSFailure = (ens: string, land: Land, error: string) =>
  action(SET_ENS_FAILURE, { ens, land, error })

export type SetENSRequestAction = ReturnType<typeof setENSRequest>
export type SetENSSuccessAction = ReturnType<typeof setENSSuccess>
export type SetENSFailureAction = ReturnType<typeof setENSFailure>
