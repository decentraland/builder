import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import { getPoolList, getTotal, getTotalPages } from 'modules/pool/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { loadPoolsRequest } from 'modules/pool/actions'
import { getAllPoolGroups } from 'modules/poolGroup/selectors'
import { SortBy } from 'modules/pool/types'
import { isLoggedIn } from 'modules/identity/selectors'
import { getPage, getSortBy, getSortOrder, getValue } from 'routing/utils'
import SceneListPage from './SceneListPage'

const SceneListPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const pools = useSelector(getPoolList)
  const poolGroups = useSelector(getAllPoolGroups)
  const total = useSelector(getTotal)
  const totalPages = useSelector(getTotalPages)

  const isUserLoggedIn = useSelector(isLoggedIn)
  const parameters = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return {
      group: getValue<string>(params.get('group')) as string | undefined,
      ethAddress: getValue<string>(params.get('eth_address')) as string | undefined,
      page: getPage(params.get('page'), 1),
      sortBy: getSortBy(
        params.get('sort_by'),
        [SortBy.NEWEST, SortBy.LIKES, SortBy.NAME, SortBy.SIZE, SortBy.ITEMS, SortBy.SMART_ITEMS],
        SortBy.NEWEST
      ),
      sortOrder: getSortOrder(params.get('sort_order'), 'desc')
    }
  }, [location.search])

  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])
  const onLoadPools: ActionFunction<typeof loadPoolsRequest> = useCallback(filters => dispatch(loadPoolsRequest(filters)), [dispatch])

  return (
    <SceneListPage
      pools={pools}
      poolGroups={poolGroups}
      total={total}
      totalPages={totalPages}
      isLoggedIn={isUserLoggedIn}
      onOpenModal={onOpenModal}
      onLoadPools={onLoadPools}
      history={history}
      location={location}
      {...parameters}
    />
  )
}

export default SceneListPageContainer
