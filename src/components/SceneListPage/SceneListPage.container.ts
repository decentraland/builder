import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'
import { locations } from 'routing/locations'

import { getPoolList, getTotal, getSortBy, getPage, getSortOrder, getSearchGroup, getSearchUserId, getTotalPages } from 'modules/pool/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { PoolsRequestFilters } from 'modules/pool/types'
import { loadPoolsRequest } from 'modules/pool/actions'
import { getAllPoolGroups } from 'modules/poolGroup/selectors'
import { isLoggedIn } from 'modules/auth/selectors'

import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneListPage.types'
import SceneListPage from './SceneListPage'

const mapState = (state: RootState): MapStateProps => ({
  pools: getPoolList(state),
  poolGroups: getAllPoolGroups(state),
  total: getTotal(state),
  totalPages: getTotalPages(state),
  page: getPage(state),
  sortBy: getSortBy(state),
  sortOrder: getSortOrder(state),
  group: getSearchGroup(state),
  userId: getSearchUserId(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLoadPools: (filters: PoolsRequestFilters) => dispatch(loadPoolsRequest(filters)),
  onPageChange: (filters: PoolsRequestFilters) => dispatch(navigateTo(locations.poolSearch(filters))),
  onNavegateToHome: () => dispatch(navigateTo(locations.root())),
  onNavegateToViewPool: (poolId: string) => dispatch(navigateTo(locations.poolView(poolId)))
})

export default connect(mapState, mapDispatch)(SceneListPage)
