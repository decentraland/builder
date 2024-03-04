import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getENSByWallet, getError as getENSError, getLoading } from 'modules/ens/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { FETCH_ENS_LIST_REQUEST } from 'modules/ens/actions'
import { getLands, getLoading as getLandsLoading, getError as getLandsError } from 'modules/land/selectors'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { getAvatar, getName } from 'modules/profile/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ENSListPage.types'
import ENSListPage from './ENSListPage'

const mapState = (state: RootState): MapStateProps => ({
  alias: getName(state),
  address: getAddress(state),
  ensList: getENSByWallet(state),
  lands: getLands(state),
  error: getENSError(state)?.message || (getLandsError(state) ?? undefined),
  hasProfileCreated: getAvatar(state) !== null,
  isLoading:
    isLoadingType(getLandsLoading(state), FETCH_LANDS_REQUEST) ||
    isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST) ||
    isLoggingIn(state),
  isLoggedIn: isLoggedIn(state),
  avatar: getAvatar(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(ENSListPage)
