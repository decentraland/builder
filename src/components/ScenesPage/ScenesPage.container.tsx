import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { useGetProjectCurrentPage, useGetProjects } from 'modules/ui/dashboard/hooks'
import { RootState } from '../../modules/common/types'
import { isFetching } from '../../modules/project/selectors'
import { isLoggingIn } from '../../modules/identity/selectors'
import { getTotalPages, didCreate } from '../../modules/ui/dashboard/selectors'
import { loadPoolsRequest } from '../../modules/pool/actions'
import { getPoolList } from '../../modules/pool/selectors'
import ScenesPage from './ScenesPage'
import { useGetSortByFromCurrentUrl } from 'modules/location/hooks'
import { SortBy } from 'modules/ui/dashboard/types'

const ScenesPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const page = useGetProjectCurrentPage()
  const projects = useGetProjects()
  const sortBy = useGetSortByFromCurrentUrl(Object.values(SortBy), SortBy.NEWEST)

  const isLoggingInState = useSelector((state: RootState) => isLoggingIn(state) || isConnecting(state))
  const isFetchingState = useSelector(isFetching)
  const totalPages = useSelector(getTotalPages)
  const didCreateState = useSelector(didCreate)
  const poolList = useSelector(getPoolList)

  const handleOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])
  const handleLoadFromScenePool: ActionFunction<typeof loadPoolsRequest> = useCallback(
    filters => dispatch(loadPoolsRequest(filters)),
    [dispatch]
  )

  return (
    <ScenesPage
      projects={projects}
      isLoggingIn={isLoggingInState}
      isFetching={isFetchingState}
      page={page}
      sortBy={sortBy}
      totalPages={totalPages}
      didCreate={didCreateState}
      poolList={poolList}
      onOpenModal={handleOpenModal}
      onLoadFromScenePool={handleLoadFromScenePool}
    />
  )
}

export default ScenesPageContainer
