import { action } from 'typesafe-actions'
import { ModelById } from 'decentraland-dapps/dist/lib/types'

import { PoolGroup } from './types'

export const LOAD_POOL_GROUPS_REQUEST = '[Request] Load projects'
export const LOAD_POOL_GROUPS_SUCCESS = '[Success] Load projects'
export const LOAD_POOL_GROUPS_FAILURE = '[Failure] Load projects'

export const loadPoolGroupsRequest = () => action(LOAD_POOL_GROUPS_REQUEST, {})
export const loadPoolGroupsSuccess = (poolGroups: ModelById<PoolGroup>) => action(LOAD_POOL_GROUPS_SUCCESS, { poolGroups })
export const loadPoolGroupsFailure = (error: string) => action(LOAD_POOL_GROUPS_FAILURE, { error })

export type LoadPoolGroupsRequestAction = ReturnType<typeof loadPoolGroupsRequest>
export type LoadPoolGroupsSuccessAction = ReturnType<typeof loadPoolGroupsSuccess>
export type LoadPoolGroupsFailureAction = ReturnType<typeof loadPoolGroupsFailure>
