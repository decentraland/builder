import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ENSListPage.types'
import { getENSByWallet, getLoading } from 'modules/ens/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { FETCH_ENS_LIST_REQUEST } from 'modules/ens/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getSortBy, getTotalPages, getPage } from 'modules/ui/ens/selectors'

import ENSListPage from './ENSListPage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLands } from 'modules/land/selectors'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  ensList: getENSByWallet(state),
  lands: getLands(state),
  isLoading: isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST) || isLoggingIn(state),
  isLoggedIn: isLoggedIn(state),
  sortBy: getSortBy(state),
  page: getPage(state),
  totalPages: getTotalPages(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onPageChange: options => dispatch(push(locations.ens(options)))
})

export default connect(mapState, mapDispatch)(ENSListPage)
