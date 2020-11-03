import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './NamesPage.types'
import { isLoading, getNames } from 'modules/names/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { fetchNamesRequest } from 'modules/names/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getSortBy, getTotalPagesNames, getPageNames } from 'modules/ui/dashboard/selectors'

import NamesPage from './NamesPage'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  names: getNames(state),
  isLoading: isLoading(state) || isLoggingIn(state),
  isLoggedIn: isLoggedIn(state),
  page: getPageNames(state),
  sortBy: getSortBy(state),
  totalPages: getTotalPagesNames(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onPageChange: options => dispatch(push(locations.names(options))),
  onFetchNames: (address, page) => dispatch(fetchNamesRequest(address, page))
})

export default connect(mapState, mapDispatch)(NamesPage)
