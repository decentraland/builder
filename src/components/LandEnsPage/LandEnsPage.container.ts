import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'
import { setNameResolverRequest, SET_NAME_RESOLVER_REQUEST } from 'modules/land/actions'
import { getENSRequest } from 'modules/ens/actions'
import { getError, getLoading } from 'modules/land/selectors';
import {isLoadingType} from 'decentraland-dapps/dist/modules/loading/selectors';
import {getEns} from 'modules/ens/selectors';

const mapState = (_state: RootState): MapStateProps => ({
  error: getError(_state),
  ens: getEns(_state),
  isLoading: isLoadingType(getLoading(_state), SET_NAME_RESOLVER_REQUEST) 
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetNameResolver: (ens, land) => dispatch(setNameResolverRequest(ens, land)),
  onGetENS: (ens, land) => dispatch(getENSRequest(ens, land))
})

export default connect(mapState, mapDispatch)(LandEditPage)
