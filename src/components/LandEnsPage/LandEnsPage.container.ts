import { push } from 'connected-react-router'
import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import {
  FETCH_ENS_REQUEST,
  fetchENSRequest,
  SET_ENS_CONTENT_REQUEST,
  setENSContentRequest,
  SET_ENS_RESOLVER_REQUEST,
  setENSResolverRequest,
  FETCH_DOMAIN_LIST_REQUEST
} from 'modules/ens/actions'
import { getLandId } from 'modules/location/selectors'
import { getENSByWallet, getLoading, getError, getIsWaitingTxSetResolver, getIsWaitingTxSetContent } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'

const mapState = (state: RootState): MapStateProps => {
  const landId = getLandId(state) || ''

  return {
    ensList: getENSByWallet(state),
    error: getError(state),
    isWaitingTxSetResolver: isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) || getIsWaitingTxSetResolver(state),
    isWaitingTxSetContent: isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) || getIsWaitingTxSetContent(state, landId),
    isLoading:
      isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) ||
      isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) ||
      isLoadingType(getLoading(state), FETCH_ENS_REQUEST) ||
      isLoadingType(getLoading(state), FETCH_DOMAIN_LIST_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENSResolver: ens => dispatch(setENSResolverRequest(ens)),
  onSetENSContent: (ens, land) => dispatch(setENSContentRequest(ens, land)),
  onFetchENS: (ens, land) => dispatch(fetchENSRequest(ens, land)),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandEditPage)
