import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import {
  FETCH_ENS_REQUEST,
  SET_ENS_CONTENT_REQUEST,
  setENSContentRequest,
  SET_ENS_RESOLVER_REQUEST,
  setENSResolverRequest,
  FETCH_ENS_LIST_REQUEST,
  reclaimNameRequest
} from 'modules/ens/actions'
import { findBySubdomain } from 'modules/ens/utils'
import {
  getENSList,
  getLoading,
  getError,
  isWaitingTxSetResolver,
  isWaitingTxSetLandContent,
  isReclaimingName,
  isWaitingTxReclaim
} from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './LandAssignENSPage.types'
import LandAssignENSPage from './LandAssignENSPage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { landId, subdomain } = ownProps.match.params
  const ensList = getENSList(state)

  const ens = findBySubdomain(ensList, subdomain)

  return {
    ens,
    error: getError(state),
    isWaitingTxSetResolver: isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) || isWaitingTxSetResolver(state),
    isWaitingTxSetContent: isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) || isWaitingTxSetLandContent(state, landId),
    isWaitingTxReclaim: ens ? isReclaimingName(state, ens.subdomain) || isWaitingTxReclaim(state) : false,
    isLoading:
      isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST) ||
      isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST) ||
      isLoadingType(getLoading(state), FETCH_ENS_REQUEST) ||
      isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENSResolver: ens => dispatch(setENSResolverRequest(ens)),
  onSetENSContent: (ens, land) => dispatch(setENSContentRequest(ens, land)),
  onReclaimName: ens => dispatch(reclaimNameRequest(ens))
})

export default connect(mapState, mapDispatch)(withRouter(LandAssignENSPage))
