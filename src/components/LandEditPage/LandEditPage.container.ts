import { connect } from 'react-redux'
import { editLandRequest } from 'modules/land/actions'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandEditPage.types'
import LandEditPage from './LandEditPage'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onEdit: (land, name, description) => dispatch(editLandRequest(land, name, description))
})

export default connect(mapState, mapDispatch)(LandEditPage)
