import { connect } from 'react-redux'
import { MapDispatchProps, MapDispatch } from './LandTransferPage.types'
import { transferLandRequest } from 'modules/land/actions'
import LandTransferPage from './LandTransferPage'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onTransfer: (land, address) => dispatch(transferLandRequest(land, address))
})

export default connect(null, mapDispatch)(LandTransferPage)
