import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { connect } from 'react-redux'
import LandAction from './LandAction'
import { MapDispatch, MapStateProps, MapDispatchProps } from './LandAction.types'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandAction)
