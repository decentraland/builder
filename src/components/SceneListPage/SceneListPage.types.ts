import { RouteComponentProps } from 'react-router'

import { Pool, PoolsRequestFilters } from 'modules/pool/types'
import { loadPoolsRequest } from 'modules/pool/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { PoolGroup } from 'modules/poolGroup/types'

export type Props = PoolsRequestFilters &
  Pick<RouteComponentProps, 'history' | 'location'> & {
    pools: Pool[] | null
    poolGroups: PoolGroup[]
    total: number | null
    totalPages: number | null
    isLoggedIn: boolean
    onLoadPools: ActionFunction<typeof loadPoolsRequest>
    onOpenModal: ActionFunction<typeof openModal>
  }

export const filterAttributes = ['page', 'sortBy', 'sortOrder', 'group', 'ethAddress'] as (keyof PoolsRequestFilters)[]
