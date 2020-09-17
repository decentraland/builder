import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'
import { setNameResolverRequest } from 'modules/land/actions'
import {getError} from 'modules/land/selectors';

const mapState = (_state: RootState): MapStateProps => ({
  error: getError(_state),
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetNameResolver: (ens, land) => dispatch(setNameResolverRequest(ens, land))
})

export default connect(mapState, mapDispatch)(LandEditPage)
