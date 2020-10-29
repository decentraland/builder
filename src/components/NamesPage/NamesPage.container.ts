import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './NamesPage.types'
import { isLoading, getNames } from 'modules/names/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import NamesPage from './NamesPage'
import { fetchNamesRequest } from 'modules/names/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  names: getNames(state),
  isLoading: isLoading(state) || isLoggingIn(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onFetchNames: address => dispatch(fetchNamesRequest(address))
})

export default connect(mapState, mapDispatch)(NamesPage)
