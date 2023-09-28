import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import NameTabs from './NameTabs'
import { MapDispatch, MapDispatchProps } from './NameTabs.types'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => {
  return {
    onNavigate: to => dispatch(push(to))
  }
}

export default connect(null, mapDispatch)(NameTabs)
