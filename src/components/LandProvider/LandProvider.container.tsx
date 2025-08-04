import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { Rental } from 'modules/land/types'
import { useGetLandIdFromCurrentUrl } from 'modules/location/hooks'
import { getLoading, getLands, getDeploymentsByLandId, getRentalForLand } from 'modules/land/selectors'
import { isLoggingIn } from 'modules/identity/selectors'
import { FETCH_LANDS_REQUEST } from 'modules/land/actions'
import { ContainerProps } from './LandProvider.types'
import LandProvider from './LandProvider'

const LandProviderContainer: React.FC<ContainerProps> = ({ id: providedId, children }) => {
  const currentUrlLandId = useGetLandIdFromCurrentUrl()
  const id = providedId || currentUrlLandId

  const lands = useSelector(getLands)
  const loading = useSelector(getLoading)
  const isLoggingInSelector = useSelector(isLoggingIn)
  const isConnectingSelector = useSelector(isConnecting)
  const deploymentsByLandId = useSelector(getDeploymentsByLandId)

  const land = useMemo(() => {
    return lands.find(land => land.id === id) || null
  }, [lands, id])

  const deployments = useMemo(() => {
    return land && land.id in deploymentsByLandId ? deploymentsByLandId[land.id] : []
  }, [land, deploymentsByLandId])

  const rental = useSelector((state: RootState): Rental | null => {
    return land ? getRentalForLand(state, land) : null
  })

  const isLoading = useMemo(() => {
    return isLoadingType(loading, FETCH_LANDS_REQUEST) || isLoggingInSelector || isConnectingSelector
  }, [loading, isLoggingInSelector, isConnectingSelector])

  return <LandProvider id={id} land={land} isLoading={isLoading} deployments={deployments} rental={rental} children={children} />
}

export default LandProviderContainer
