import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps } from './Routes.types'
import { withRouter } from 'react-router'

import Routes from './Routes'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (_: any) => ({})

export default withRouter(
  connect(
    mapState,
    mapDispatch
  )(Routes)
)
