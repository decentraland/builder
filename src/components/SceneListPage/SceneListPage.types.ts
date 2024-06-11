import { Dispatch } from 'redux'

import { Pool, PoolsRequestFilters } from 'modules/pool/types'
import { LikePoolRequestAction, LoadPoolsRequestAction, loadPoolsRequest } from 'modules/pool/actions'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { PoolGroup } from 'modules/poolGroup/types'
import { RouteComponentProps } from 'react-router'

export type Props = PoolsRequestFilters &
  RouteComponentProps & {
    pools: Pool[] | null
    poolGroups: PoolGroup[]
    total: number | null
    totalPages: number | null
    isLoggedIn: boolean
    onLoadPools: typeof loadPoolsRequest
    onOpenModal: typeof openModal
  }

export type MapStateProps = Pick<
  Props,
  'pools' | 'poolGroups' | 'total' | 'totalPages' | 'page' | 'sortBy' | 'sortOrder' | 'group' | 'ethAddress' | 'isLoggedIn'
>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onLoadPools'>
export type MapDispatch = Dispatch<LikePoolRequestAction | OpenModalAction | LoadPoolsRequestAction>

export const filterAttributes = ['page', 'sortBy', 'sortOrder', 'group', 'ethAddress'] as (keyof PoolsRequestFilters)[]
