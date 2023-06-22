import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { MapDispatchProps, MapDispatch } from './TemplatesAnnouncementModal.types'
import TemplatesAnnouncementModal from './TemplatesAnnouncementModal'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(null, mapDispatch)(TemplatesAnnouncementModal)
