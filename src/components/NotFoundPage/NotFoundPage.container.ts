import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { RootState } from 'modules/common/types'
import { MapDispatch, MapDispatchProps } from './NotFoundPage.types'
import NotFoundPage from './NotFoundPage'

const mapState = (_: RootState) => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (path: string) => dispatch(navigateTo(path))
})

export default connect(
  mapState,
  mapDispatch
)(NotFoundPage)
