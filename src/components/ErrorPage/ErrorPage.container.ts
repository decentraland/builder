import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { RootState } from 'modules/common/types'
import { MapDispatch, MapDispatchProps } from './ErrorPage.types'
import ErrorPage from './ErrorPage'

const mapState = (_: RootState) => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (path: string) => dispatch(navigateTo(path))
})

export default connect(
  mapState,
  mapDispatch
)(ErrorPage)
