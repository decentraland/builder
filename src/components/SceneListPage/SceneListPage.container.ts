import { connect } from 'react-redux'
import { getLocation, push } from 'connected-react-router'
import { locations } from 'routing/locations'

import {
  getPoolList,
  getTotal,
  getSortBy,
  getPage,
  getSortOrder,
  getSearchGroup,
  getSearchEthAddress,
  getTotalPages
} from 'modules/pool/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { PoolsRequestFilters } from 'modules/pool/types'
import { loadPoolsRequest } from 'modules/pool/actions'
import { getAllPoolGroups } from 'modules/poolGroup/selectors'
import { isLoggedIn } from 'modules/identity/selectors'

import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneListPage.types'
import SceneListPage from './SceneListPage'

const mapState = (state: RootState): MapStateProps => ({
  location: getLocation(state),
  pools: getPoolList(state),
  poolGroups: getAllPoolGroups(state),
  total: getTotal(state),
  totalPages: getTotalPages(state),
  page: getPage(state),
  sortBy: getSortBy(state),
  sortOrder: getSortOrder(state),
  group: getSearchGroup(state),
  ethAddress: getSearchEthAddress(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLoadPools: (filters: PoolsRequestFilters) => dispatch(loadPoolsRequest(filters)),
  onPageChange: (filters: PoolsRequestFilters) => dispatch(push(locations.poolSearch(filters))),
  onNavegateToHome: () => dispatch(push(locations.root())),
  onNavegateToViewPool: (poolId: string) => dispatch(push(locations.poolView(poolId)))
})

export default connect(mapState, mapDispatch)(SceneListPage)
