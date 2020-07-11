import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getProjectsByLand } from 'modules/land/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps, OwnProps } from './Popup.types'
import Popup from './Popup'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const projectsByLand = getProjectsByLand(state)
  const projects = projectsByLand[ownProps.land.id] || []
  return {
    projects
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Popup)
