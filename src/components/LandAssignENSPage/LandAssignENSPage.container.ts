import { push, goBack } from 'connected-react-router'
import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_ENS_LIST_REQUEST } from 'decentraland-dapps/dist/modules/ens/actions'
import { RootState } from 'modules/common/types'
import {
  FETCH_ENS_REQUEST,
  SET_ENS_CONTENT_REQUEST,
  setENSContentRequest,
  SET_ENS_RESOLVER_REQUEST,
  setENSResolverRequest,
  FILL_ENS_LIST_REQUEST
} from 'modules/ens/actions'
import { findBySubdomain } from 'modules/ens/utils'
import { getENSList, getLoading, getError, isWaitingTxSetResolver, isWaitingTxSetLandContent } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './LandAssignENSPage.types'
import LandAssignENSPage from './LandAssignENSPage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { landId, subdomain } = ownProps.match.params
  const ensList = getENSList(state)

  const ens = findBySubdomain(ensList, subdomain)!

  return {
    ens,
    error: getError(state),
    isWaitingTxSetResolver: isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) || isWaitingTxSetResolver(state),
    isWaitingTxSetContent: isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) || isWaitingTxSetLandContent(state, landId),
    isLoading:
      isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) ||
      isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) ||
      isLoadingType(getLoading(state), FETCH_ENS_REQUEST) ||
      isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST) ||
      isLoadingType(getLoading(state), FILL_ENS_LIST_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENSResolver: ens => dispatch(setENSResolverRequest(ens)),
  onSetENSContent: (ens, land) => dispatch(setENSContentRequest(ens, land)),
  onBack: () => dispatch(goBack()),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandAssignENSPage)
