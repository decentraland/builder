import { connect } from 'react-redux'
import { withRouter } from 'react-router'

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
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { PoolsRequestFilters } from 'modules/pool/types'
import { loadPoolsRequest } from 'modules/pool/actions'
import { getAllPoolGroups } from 'modules/poolGroup/selectors'
import { isLoggedIn } from 'modules/identity/selectors'

import { MapStateProps, MapDispatch, MapDispatchProps } from './SceneListPage.types'
import SceneListPage from './SceneListPage'

const mapState = (state: RootState): MapStateProps => ({
  pools: getPoolList(state),
  poolGroups: getAllPoolGroups(state),
  total: getTotal(state),
  totalPages: getTotalPages(state),
  page: getPage(),
  sortBy: getSortBy(),
  sortOrder: getSortOrder(),
  group: getSearchGroup(),
  ethAddress: getSearchEthAddress(),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLoadPools: (filters: PoolsRequestFilters) => dispatch(loadPoolsRequest(filters))
})

export default connect(mapState, mapDispatch)(withRouter(SceneListPage))
