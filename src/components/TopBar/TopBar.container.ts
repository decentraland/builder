import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps } from './TopBar.types'
import TopBar from './TopBar'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state)
})

const mapDispatch = (): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(TopBar)
