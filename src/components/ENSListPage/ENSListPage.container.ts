import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ENSListPage.types'
import { getENSByWallet, getLoading } from 'modules/ens/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { FETCH_ENS_LIST_REQUEST } from 'modules/ens/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import ENSListPage from './ENSListPage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLands, getLoading as getLandsLoading } from 'modules/land/selectors'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { getName } from 'modules/profile/selectors'
import { openModal } from 'modules/modal/actions'

const mapState = (state: RootState): MapStateProps => ({
  alias: getName(state),
  address: getAddress(state),
  ensList: getENSByWallet(state),
  lands: getLands(state),
  isLoading:
    isLoadingType(getLandsLoading(state), FETCH_LANDS_REQUEST) ||
    isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST) ||
    isLoggingIn(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(ENSListPage)
