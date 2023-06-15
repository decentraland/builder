import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { MapDispatchProps, MapDispatch } from './TemplatesPage.types'
import ScenesPage from './TemplatesPage'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (path: string) => dispatch(push(path))
})

export default connect(null, mapDispatch)(ScenesPage)
