import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ENSListPage.types'
import { getENSByWallet, getLoading } from 'modules/ens/selectors'
import { isLoggingIn, isLoggedIn } from 'modules/identity/selectors'
import { changeProfileRequest, CHANGE_PROFILE_REQUEST, FETCH_ENS_LIST_REQUEST } from 'modules/ens/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import ENSListPage from './ENSListPage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLands, getLoading as getLandsLoading } from 'modules/land/selectors'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { getName } from 'modules/profile/selectors'

const mapState = (state: RootState): MapStateProps => ({
  alias: getName(state),
  address: getAddress(state),
  ensList: getENSByWallet(state),
  lands: getLands(state),
  isLoading:
    isLoadingType(getLandsLoading(state), FETCH_LANDS_REQUEST) ||
    isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST) ||
    isLoggingIn(state),
  isLoadingUseAsAlias: isLoadingType(getLoading(state), CHANGE_PROFILE_REQUEST),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onChangeProfile: name => dispatch(changeProfileRequest(name))
})

export default connect(mapState, mapDispatch)(ENSListPage)
