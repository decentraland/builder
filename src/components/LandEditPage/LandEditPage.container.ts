import { connect } from 'react-redux'
import { editLandRequest } from 'modules/land/actions'
import { MapDispatchProps, MapDispatch } from './LandEditPage.types'
import LandEditPage from './LandEditPage'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onEdit: (land, name, description) => dispatch(editLandRequest(land, name, description))
})

export default connect(null, mapDispatch)(LandEditPage)
