import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'
import { getENSRequest, GET_ENS_REQUEST, SET_ENS_REQUEST, setENSRequest, GET_DOMAINLIST_REQUEST, getDomainListRequest } from 'modules/ens/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors';
import { getState, getLoading, getError, getSubdomainList } from 'modules/ens/selectors';

const mapState = (state: RootState): MapStateProps => ({
  subdomainList: getSubdomainList(state),
  error: getError(state),
  ens: getState(state),
  isLoading: isLoadingType(getLoading(state), SET_ENS_REQUEST) || 
             isLoadingType(getLoading(state), GET_ENS_REQUEST) ||
             isLoadingType(getLoading(state), GET_DOMAINLIST_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENS: (ens, land) => dispatch(setENSRequest(ens, land)),
  onGetENS: (ens, land) => dispatch(getENSRequest(ens, land)),
  onGetDomainList: () => dispatch(getDomainListRequest())
})

export default connect(mapState, mapDispatch)(LandEditPage)
