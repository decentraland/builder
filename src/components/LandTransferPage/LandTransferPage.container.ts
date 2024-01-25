import { connect } from 'react-redux'
import { transferLandRequest } from 'modules/land/actions'
import { RootState } from 'modules/common/types'
import { getIsEnsAddressEnabled } from 'modules/features/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps } from './LandTransferPage.types'
import LandTransferPage from './LandTransferPage'

const mapState = (state: RootState): MapStateProps => ({
  isEnsAddressEnabled: getIsEnsAddressEnabled(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onTransfer: (land, address) => dispatch(transferLandRequest(land, address))
})

export default connect(mapState, mapDispatch)(LandTransferPage)
