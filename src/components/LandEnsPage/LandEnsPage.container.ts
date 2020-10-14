import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'
import {
  FETCH_ENS_REQUEST,
  fetchENSRequest,
  SET_ENS_CONTENT_REQUEST,
  setENSContentRequest,
  SET_ENS_RESOLVER_REQUEST,
  setENSResolverRequest,
  FETCH_DOMAIN_LIST_REQUEST,
  fetchDomainListRequest
} from 'modules/ens/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getState, getLoading, getError, getSubdomainList, getWaitingTxSetContent, getWaitingTxSetResolver } from 'modules/ens/selectors'
import { push } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => ({
  subdomainList: getSubdomainList(state),
  error: getError(state),
  ens: getState(state),
  isWaitingTxSetResolver: getWaitingTxSetResolver(state),
  isWaitingTxSetContent: getWaitingTxSetContent(state),
  isLoading:
    isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) ||
    isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) ||
    isLoadingType(getLoading(state), FETCH_ENS_REQUEST) ||
    isLoadingType(getLoading(state), FETCH_DOMAIN_LIST_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENSResolver: (ens, land) => dispatch(setENSResolverRequest(ens, land)),
  onSetENSContent: (ens, land) => dispatch(setENSContentRequest(ens, land)),
  onFetchENS: (ens, land) => dispatch(fetchENSRequest(ens, land)),
  onFetchDomainList: () => dispatch(fetchDomainListRequest()),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandEditPage)
