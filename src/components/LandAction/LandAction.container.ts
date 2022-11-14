import { push } from 'connected-react-router'
import { connect } from 'react-redux'
import LandAction from './LandAction'
import { MapDispatch, MapDispatchProps } from './LandAction.types'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(null, mapDispatch)(LandAction)
