import { connect } from 'react-redux'
import { transferLandRequest } from 'modules/land/actions'
import { MapDispatchProps, MapDispatch } from './LandTransferPage.types'
import LandTransferPage from './LandTransferPage'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onTransfer: (land, address) => dispatch(transferLandRequest(land, address))
})

export default connect(undefined, mapDispatch)(LandTransferPage)
