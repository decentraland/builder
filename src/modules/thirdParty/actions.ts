import { action } from 'typesafe-actions'
import { ThirdParty } from './types'

// Fetch collections

export const FETCH_THIRD_PARTIES_REQUEST = '[Request] Fetch Thrid Parties'
export const FETCH_THIRD_PARTIES_SUCCESS = '[Success] Fetch Thrid Parties'
export const FETCH_THIRD_PARTIES_FAILURE = '[Failure] Fetch Thrid Parties'

export const fetchThirdPartiesRequest = (address?: string) => action(FETCH_THIRD_PARTIES_REQUEST, { address })
export const fetchThirdPartiesSuccess = (thirdParties: ThirdParty[]) => action(FETCH_THIRD_PARTIES_SUCCESS, { thirdParties })
export const fetchThirdPartiesFailure = (error: string) => action(FETCH_THIRD_PARTIES_FAILURE, { error })

export type FetchThirdPartiesRequestAction = ReturnType<typeof fetchThirdPartiesRequest>
export type FetchThirdPartiesSuccessAction = ReturnType<typeof fetchThirdPartiesSuccess>
export type FetchThirdPartiesFailureAction = ReturnType<typeof fetchThirdPartiesFailure>
