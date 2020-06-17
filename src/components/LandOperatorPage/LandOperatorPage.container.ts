import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandOperatorPage.types'
import LandEditPage from './LandOperatorPage'
import { setOperatorRequest } from 'modules/land/actions'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetOperator: (land, address) => dispatch(setOperatorRequest(land, address))
})

export default connect(mapState, mapDispatch)(LandEditPage)
