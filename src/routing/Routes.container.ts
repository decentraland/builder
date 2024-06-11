import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { RootState } from 'modules/common/types'
import { getIsMaintenanceEnabled } from 'modules/features/selectors'
import { MapStateProps } from './Routes.types'
import Routes from './Routes'

const mapState = (state: RootState): MapStateProps => ({
  inMaintenance: getIsMaintenanceEnabled(state)
})

export default withRouter(connect(mapState)(Routes))
