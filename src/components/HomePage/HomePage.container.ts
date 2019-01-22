import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { getData as getProjects } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './HomePage.types'
import HomePage from './HomePage'

const mapState = (state: RootState): MapStateProps => ({
  projects: getProjects(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onProjectClick: (projectId: string) => dispatch(navigateTo(locations.editor(projectId)))
})

export default connect(
  mapState,
  mapDispatch
)(HomePage)
