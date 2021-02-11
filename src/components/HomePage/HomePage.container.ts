import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { isFetching } from 'modules/project/selectors'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { getProjects, getPage, getSortBy, getTotalPages, didSync, didCreate } from 'modules/ui/dashboard/selectors'
import { loadPoolsRequest } from 'modules/pool/actions'
import { getPoolList } from 'modules/pool/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './HomePage.types'
import HomePage from './HomePage'

const mapState = (state: RootState): MapStateProps => ({
  projects: getProjects(state),
  isLoggingIn: isLoggingIn(state) || isConnecting(state),
  isFetching: isFetching(state),
  page: getPage(state),
  sortBy: getSortBy(state),
  totalPages: getTotalPages(state),
  didCreate: didCreate(state),
  didSync: didSync(state),
  isLoggedIn: isLoggedIn(state),
  poolList: getPoolList(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onPageChange: options => dispatch(push(locations.root(options))),
  onNavigate: path => dispatch(push(path)),
  onLoadFromScenePool: filters => dispatch(loadPoolsRequest(filters))
})

export default connect(mapState, mapDispatch)(HomePage)
