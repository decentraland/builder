import { createSelector } from 'reselect'
import { Tile } from 'react-tile-map/lib/src/lib/common'
import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { getCurrentProject, getUserProjects } from 'modules/project/selectors'
import { getLandTiles, getDeploymentsByCoord } from 'modules/land/selectors'
import { LandTile, RoleType } from 'modules/land/types'
import { ProgressStage, DeploymentStatus, Deployment } from './types'
import { DeploymentState } from './reducer'
import { getStatus, mergeStatuses } from './utils'
import { idToCoords, coordsToId } from 'modules/land/utils'

export const getState = (state: RootState) => state.deployment
export const getData = (state: RootState) => getState(state).data
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getError = (state: RootState) => getState(state).error
export const getProgress = (state: RootState) => getState(state).progress
export const isUploadingRecording = (state: RootState) => getState(state).progress.stage === ProgressStage.UPLOAD_RECORDING
export const isUploadingAssets = (state: RootState) => getState(state).progress.stage === ProgressStage.UPLOAD_SCENE_ASSETS
export const isCreatingFiles = (state: RootState) => getState(state).progress.stage === ProgressStage.CREATE_FILES

export const getDeploymentsByProjectId = createSelector<
  RootState,
  DeploymentState['data'],
  Record<string, Project>,
  Record<string, Deployment[]>
>(getData, getUserProjects, (deployments, projects) => {
  let out: Record<string, Deployment[]> = {}
  for (const deployment of Object.values(deployments)) {
    const project = deployment.projectId && deployment.projectId in projects ? projects[deployment.projectId] : null
    if (project) {
      const exists = project.id in out
      if (!exists) {
        out[project.id] = []
      }
      out[project.id].push(deployment)
    }
  }
  return out
})

export const getCurrentDeployments = createSelector<RootState, Record<string, Deployment[]>, Project | null, Deployment[]>(
  getDeploymentsByProjectId,
  getCurrentProject,
  (deploymentsByProjectId, project) => {
    return project && project.id in deploymentsByProjectId ? deploymentsByProjectId[project.id] : []
  }
)

export const getDeploymentStatusByProjectId = createSelector<
  RootState,
  Record<string, Deployment[]>,
  Record<string, Project>,
  Record<string, DeploymentStatus>
>(getDeploymentsByProjectId, getUserProjects, (deploymentsByProjectId, projects) => {
  const out: Record<string, DeploymentStatus> = {}
  for (const project of Object.values(projects)) {
    const deployments = deploymentsByProjectId[project.id] || []
    const statuses = deployments.map(deployment => getStatus(project, deployment))
    const status = mergeStatuses(statuses)
    out[project.id] = status
  }
  return out
})

export const getCurrentDeploymentStatus = createSelector<RootState, Project | null, Record<string, DeploymentStatus>, DeploymentStatus>(
  getCurrentProject,
  getDeploymentStatusByProjectId,
  (project, deploymentStatusByProjectId) => {
    return project ? deploymentStatusByProjectId[project.id] : DeploymentStatus.UNPUBLISHED
  }
)
export const getEmptyTiles = createSelector<RootState, Record<string, Deployment>, Record<string, LandTile>, Record<string, Tile>>(
  state => getDeploymentsByCoord(state),
  state => getLandTiles(state),
  (deploymentsByCoord, landTiles) => {
    const result: Record<string, Tile> = {}

    for (const id of Object.keys(landTiles)) {
      const isOccupied = id in deploymentsByCoord
      const role = landTiles[id].land.role
      if (!isOccupied) {
        result[id] = {
          color: role === RoleType.OWNER ? '#ab2039' : '#147eab',
          scale: 1
        }
      }
    }

    // connect unoccupied tiles
    for (const id of Object.keys(result)) {
      const land = landTiles[id].land
      const [x, y] = idToCoords(id)

      const topId = coordsToId(x, y + 1)
      const leftId = coordsToId(x - 1, y)
      const topLeftId = coordsToId(x - 1, y + 1)

      const topLand = landTiles[topId]
      const leftLand = landTiles[leftId]
      const topLeftLand = landTiles[topLeftId]

      const top = !!topLand && topLand.land.id === land.id
      const left = !!leftLand && leftLand.land.id === land.id
      const topLeft = !!topLeftLand && topLeftLand.land.id === land.id

      result[id] = {
        ...result[id],
        top,
        left,
        topLeft
      }
    }

    return result
  }
)

export const getDeploymentsByBase = createSelector<RootState, DeploymentState['data'], Record<string, Deployment>>(getData, deployments =>
  Object.values(deployments).reduce((obj, deployment) => {
    obj[deployment.base] = deployment
    return obj
  }, {} as Record<string, Deployment>)
)
