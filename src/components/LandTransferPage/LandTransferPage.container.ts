import { connect } from 'react-redux'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandTransferPage.types'
import { transferLandRequest } from 'modules/land/actions'
import { RootState } from 'modules/common/types'
import LandTransferPage from './LandTransferPage'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onTransfer: (land, address) => dispatch(transferLandRequest(land, address))
})

export default connect(mapState, mapDispatch)(LandTransferPage)
