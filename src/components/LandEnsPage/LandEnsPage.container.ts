import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'
import {
  GET_ENS_REQUEST,
  getENSRequest,
  SET_ENS_CONTENT_REQUEST,
  setENSContentRequest,
  SET_ENS_RESOLVER_REQUEST,
  setENSResolverRequest,
  GET_DOMAINLIST_REQUEST,
  getDomainListRequest
} from 'modules/ens/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getState, getLoading, getError, getSubdomainList, getLoadingTx } from 'modules/ens/selectors'
import {push} from 'connected-react-router';

const mapState = (state: RootState): MapStateProps => ({
  subdomainList: getSubdomainList(state),
  error: getError(state),
  ens: getState(state),
  isWaitingConfirmationTx: getLoadingTx(state),
  isLoading: isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) ||
             isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) ||
             isLoadingType(getLoading(state), GET_ENS_REQUEST) ||
             isLoadingType(getLoading(state), GET_DOMAINLIST_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENSResolver: (ens, land) => dispatch(setENSResolverRequest(ens, land)),
  onSetENSContent: (ens, land) => dispatch(setENSContentRequest(ens, land)),
  onGetENS: (ens, land) => dispatch(getENSRequest(ens, land)),
  onGetDomainList: () => dispatch(getDomainListRequest()),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandEditPage)
