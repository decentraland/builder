import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEnsPage.types'
import LandEditPage from './LandEnsPage'
import { setNameResolverRequest } from 'modules/land/actions'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetNameResolver: (ens, land) => dispatch(setNameResolverRequest(ens, land))
})

export default connect(mapState, mapDispatch)(LandEditPage)
