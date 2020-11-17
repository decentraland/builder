import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandOperatorPage.types'
import { setOperatorRequest } from 'modules/land/actions'
import LandOperatorPage from './LandOperatorPage'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetOperator: (land, address) => dispatch(setOperatorRequest(land, address))
})

export default connect(mapState, mapDispatch)(LandOperatorPage)
