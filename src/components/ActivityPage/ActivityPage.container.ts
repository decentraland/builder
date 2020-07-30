import { connect } from 'react-redux'
import { clearTransactions } from 'decentraland-dapps/dist/modules/transaction/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ActivityPage.types'
import ActivityPage from './ActivityPage'
import { getTransactions } from 'modules/transaction/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { push } from 'connected-react-router';

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state),
  address: getAddress(state),
  transactions: getTransactions(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClearHistory: address => dispatch(clearTransactions(address)),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(ActivityPage)
