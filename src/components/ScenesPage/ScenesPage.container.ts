import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { isFetching } from 'modules/project/selectors'
import { isLoggingIn } from 'modules/identity/selectors'
import { getProjects, getPage, getSortBy, getTotalPages, didCreate } from 'modules/ui/dashboard/selectors'
import { loadPoolsRequest } from 'modules/pool/actions'
import { getPoolList } from 'modules/pool/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ScenesPage.types'
import ScenesPage from './ScenesPage'

const mapState = (state: RootState): MapStateProps => ({
  projects: getProjects(state),
  isLoggingIn: isLoggingIn(state) || isConnecting(state),
  isFetching: isFetching(state),
  page: getPage(state),
  sortBy: getSortBy(state),
  totalPages: getTotalPages(state),
  didCreate: didCreate(state),
  poolList: getPoolList(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onPageChange: options => dispatch(push(locations.scenes(options))),
  onLoadFromScenePool: filters => dispatch(loadPoolsRequest(filters))
})

export default connect(mapState, mapDispatch)(ScenesPage)
