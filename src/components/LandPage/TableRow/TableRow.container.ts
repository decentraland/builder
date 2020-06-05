import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getProjectsByLand } from 'modules/land/selectors'
import { MapDispatch, MapDispatchProps, MapStateProps, OwnProps } from './TableRow.types'
import TableRow from './TableRow'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const projectsByLand = getProjectsByLand(state)
  const projects = projectsByLand[ownProps.land.id] || []
  return {
    projects
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(TableRow)
