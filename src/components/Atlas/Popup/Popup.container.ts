import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getData as getProjects } from 'modules/project/selectors'
import { getProjectIdsByLand } from 'modules/land/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps, OwnProps } from './Popup.types'
import Popup from './Popup'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const projects = getProjects(state)
  const projectIdsByLand = getProjectIdsByLand(state)
  const projectIds = projectIdsByLand[ownProps.land.id] || []

  return {
    projects: projectIds.map(id => projects[id])
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Popup)
