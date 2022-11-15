import { connect } from 'react-redux'
import { MapDispatchProps, MapDispatch } from './LandOperatorPage.types'
import { setOperatorRequest } from 'modules/land/actions'
import LandOperatorPage from './LandOperatorPage'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetOperator: (land, address) => dispatch(setOperatorRequest(land, address))
})

export default connect(null, mapDispatch)(LandOperatorPage)
