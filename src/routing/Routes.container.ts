import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps } from './Routes.types'
import { withRouter } from 'react-router'

import Routes from './Routes'
import { getIsMaintenanceEnabled } from 'modules/features/selectors'

const mapState = (state: RootState): MapStateProps => ({
  inMaintenance: getIsMaintenanceEnabled(state)
})

const mapDispatch = (_: any) => ({})

export default withRouter(connect(mapState, mapDispatch)(Routes))
