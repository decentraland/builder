import { connect } from 'react-redux'
import { setOperatorRequest } from 'modules/land/actions'
import { RootState } from 'modules/common/types'
import { getIsEnsAddressEnabled } from 'modules/features/selectors'
import LandOperatorPage from './LandOperatorPage'
import { MapDispatchProps, MapDispatch, MapStateProps } from './LandOperatorPage.types'

const mapState = (state: RootState): MapStateProps => ({
  isEnsAddressEnabled: getIsEnsAddressEnabled(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetOperator: (land, address) => dispatch(setOperatorRequest(land, address))
})

export default connect(mapState, mapDispatch)(LandOperatorPage)
