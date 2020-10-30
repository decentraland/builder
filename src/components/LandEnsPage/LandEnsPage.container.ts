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
import { getENSList, getLoading, getError, getIsWaitingTxSetResolver, getIsWaitingTxSetContent } from 'modules/ens/selectors'
import { push } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSList(state),
  error: getError(state),
  isWaitingTxSetResolver: isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) || getIsWaitingTxSetResolver(state),
  isWaitingTxSetContent: isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) || getIsWaitingTxSetContent(state),
  isLoading:
    isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) ||
    isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) ||
    isLoadingType(getLoading(state), FETCH_ENS_REQUEST) ||
    isLoadingType(getLoading(state), FETCH_DOMAIN_LIST_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENSResolver: ens => dispatch(setENSResolverRequest(ens)),
  onSetENSContent: (ens, land) => dispatch(setENSContentRequest(ens, land)),
  onFetchENS: (ens, land) => dispatch(fetchENSRequest(ens, land)),
  onFetchDomainList: () => dispatch(fetchDomainListRequest()),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandEditPage)
