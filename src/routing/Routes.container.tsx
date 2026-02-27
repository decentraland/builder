import React from 'react'
import { useSelector } from 'react-redux'
import { withRouter } from 'react-router'
import { getIsMaintenanceEnabled } from 'modules/features/selectors'
import { RoutesContainerProps } from './Routes.types'
import Routes from './Routes'

const RoutesContainer: React.FC<RoutesContainerProps> = props => {
  const inMaintenance = useSelector(getIsMaintenanceEnabled)

  return <Routes {...props} inMaintenance={inMaintenance} />
}

export default withRouter(RoutesContainer)
