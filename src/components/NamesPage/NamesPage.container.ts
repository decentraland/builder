import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './NamesPage.types'
import { getENSByWallet, getLoading } from 'modules/ens/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { fetchDomainListRequest, FETCH_DOMAIN_LIST_SUCCESS } from 'modules/ens/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getSortBy, getTotalPages, getPage } from 'modules/ui/ens/selectors'

import NamesPage from './NamesPage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  names: getENSByWallet(state),
  isLoading: isLoadingType(getLoading(state), FETCH_DOMAIN_LIST_SUCCESS) || isLoggingIn(state),
  isLoggedIn: isLoggedIn(state),
  sortBy: getSortBy(state),
  page: getPage(state),
  totalPages: getTotalPages(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onPageChange: options => dispatch(push(locations.names(options))),
  onFetchNames: () => dispatch(fetchDomainListRequest())
})

export default connect(mapState, mapDispatch)(NamesPage)
