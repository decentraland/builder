import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import { RootState } from 'modules/common/types'
import { MapDispatch, MapDispatchProps } from './ErrorPage.types'
import ErrorPage from './ErrorPage'

const mapState = (_: RootState) => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (path: string) => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(ErrorPage)
