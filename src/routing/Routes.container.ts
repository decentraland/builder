import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { RootState } from 'modules/common/types'
import { getIsMaintenanceEnabled, getIsWorldsForEnsOwnersEnabled } from 'modules/features/selectors'
import { MapStateProps } from './Routes.types'
import Routes from './Routes'

const mapState = (state: RootState): MapStateProps => ({
  inMaintenance: getIsMaintenanceEnabled(state),
  isWorldsForEnsOwnersEnabled: getIsWorldsForEnsOwnersEnabled(state)
})

const mapDispatch = (_: any) => ({})

export default withRouter(connect(mapState, mapDispatch)(Routes))
