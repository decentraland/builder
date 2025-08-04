import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import { useGetLandIdFromCurrentUrl } from 'modules/location/hooks'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getParcelsAvailableToBuildEstates, getDeploymentsByCoord, getLandTiles } from 'modules/land/selectors'
import { getENSForLand } from 'modules/ens/selectors'
import { getData as getProjects } from 'modules/project/selectors'
import LandDetailPage from './LandDetailPage'

const LandDetailPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const landId = useGetLandIdFromCurrentUrl() || ''

  const ensList = useSelector((state: RootState) => getENSForLand(state, landId))
  const parcelsAvailableToBuildEstates = useSelector((state: RootState) => getParcelsAvailableToBuildEstates(state))
  const deploymentsByCoord = useSelector((state: RootState) => getDeploymentsByCoord(state))
  const landTiles = useSelector((state: RootState) => getLandTiles(state))
  const projects = useSelector((state: RootState) => getProjects(state))

  const handleOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])

  return (
    <LandDetailPage
      ensList={ensList}
      parcelsAvailableToBuildEstates={parcelsAvailableToBuildEstates}
      deploymentsByCoord={deploymentsByCoord}
      landTiles={landTiles}
      projects={projects}
      onOpenModal={handleOpenModal}
      history={history}
    />
  )
}

export default LandDetailPageContainer
