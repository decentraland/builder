import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getData as getProjects } from 'modules/project/selectors'
import { MapStateProps } from './Routes.types'
import { withRouter } from 'react-router'

import Routes from './Routes'

const mapState = (state: RootState): MapStateProps => ({
  projectCount: Object.keys(getProjects(state)).length
})

const mapDispatch = (_: any) => ({})

export default withRouter(
  connect(
    mapState,
    mapDispatch
  )(Routes)
)
