import { Dispatch } from 'redux'
import { NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

import { Pool, PoolsRequestFilters } from 'modules/pool/types'
import { LikePoolRequestAction, LoadPoolsRequestAction, loadPoolsRequest } from 'modules/pool/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { PoolGroup } from 'modules/poolGroup/types'

export type Props = PoolsRequestFilters & {
  pools: Pool[] | null
  poolGroups: PoolGroup[]
  total: number | null
  totalPages: number | null
  isLoggedIn: boolean
  onNavegateToHome: () => void
  onNavegateToViewPool: (poolId: string) => void
  onPageChange: (filters: PoolsRequestFilters) => void
  onLoadPools: typeof loadPoolsRequest
  onOpenModal: typeof openModal
}

export type State = {}

export type MapStateProps = Pick<
  Props,
  'pools' | 'poolGroups' | 'total' | 'totalPages' | 'page' | 'sortBy' | 'sortOrder' | 'group' | 'userId' | 'isLoggedIn'
>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onPageChange' | 'onNavegateToHome' | 'onNavegateToViewPool' | 'onLoadPools'>
export type MapDispatch = Dispatch<LikePoolRequestAction | OpenModalAction | LoadPoolsRequestAction | NavigateToAction>

export const filterAttributes = (['page', 'sortBy', 'sortOrder', 'group', 'userId'] as (keyof PoolsRequestFilters)[])
