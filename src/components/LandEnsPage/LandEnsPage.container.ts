import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'
import { getENSRequest, GET_ENS_REQUEST, SET_ENS_REQUEST, setENSRequest } from 'modules/ens/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors';
import { getState, getLoading, getError } from 'modules/ens/selectors';
import { Land } from 'modules/land/types';

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  ens: getState(state),
  isLoading: isLoadingType(getLoading(state), SET_ENS_REQUEST) || isLoadingType(getLoading(state), GET_ENS_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetENS: (ens:string, land:Land) => dispatch(setENSRequest(ens, land)),
  onGetENS: (ens:string, land:Land) => dispatch(getENSRequest(ens, land))
})

export default connect(mapState, mapDispatch)(LandEditPage)
