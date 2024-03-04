import { connect } from 'react-redux'
import { setOperatorRequest } from 'modules/land/actions'
import LandOperatorPage from './LandOperatorPage'
import { MapDispatchProps, MapDispatch } from './LandOperatorPage.types'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetOperator: (land, address) => dispatch(setOperatorRequest(land, address))
})

export default connect(undefined, mapDispatch)(LandOperatorPage)
