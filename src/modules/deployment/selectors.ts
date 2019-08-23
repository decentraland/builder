import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { getCurrentProject, getData as getProjects } from 'modules/project/selectors'
import { ProjectState } from 'modules/project/reducer'
import { ProgressStage, DeploymentStatus, Deployment, OccupiedAtlasParcel } from './types'
import { getParcelOrientation } from 'modules/project/utils'
import { DeploymentState } from './reducer'
import { getStatus } from './utils'

export const getState = (state: RootState) => state.deployment
export const getData = (state: RootState) => getState(state).data
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getError = (state: RootState) => getState(state).error
export const getProgress = (state: RootState) => getState(state).progress
export const isUploadingRecording = (state: RootState) => getState(state).progress.stage === ProgressStage.UPLOAD_RECORDING
export const isUploadingAssets = (state: RootState) => getState(state).progress.stage === ProgressStage.UPLOAD_SCENE_ASSETS
export const isCreatingFiles = (state: RootState) => getState(state).progress.stage === ProgressStage.CREATE_FILES

export const getCurrentDeployment = createSelector<RootState, DeploymentState['data'], Project | null, Deployment | null>(
  getData,
  getCurrentProject,
  (data, project) => {
    if (!project || Object.keys(data).length === 0) return null
    return data[project.id]
  }
)

export const getDeploymentStatus = createSelector<
  RootState,
  DeploymentState['data'],
  ProjectState['data'],
  Record<string, DeploymentStatus>
>(
  getData,
  getProjects,
  (data, projects) => {
    const out: Record<string, DeploymentStatus> = {}
    for (let projectId in projects) {
      const deployment = data[projectId]
      out[projectId] = getStatus(deployment)
    }
    return out
  }
)

export const getCurrentDeploymentStatus = createSelector<RootState, DeploymentState['data'], Project | null, DeploymentStatus>(
  getData,
  getCurrentProject,
  (data, project) => {
    if (!project || Object.keys(data).length === 0) return DeploymentStatus.UNPUBLISHED
    const deployment = data[project.id]
    return getStatus(deployment)
  }
)

export const getOccuppiedParcels = createSelector<
  RootState,
  DeploymentState['data'],
  ProjectState['data'],
  Record<string, OccupiedAtlasParcel>
>(
  getData,
  getProjects,
  (data, projects) => {
    const out: Record<string, OccupiedAtlasParcel> = {}
    for (let projectId in data) {
      const deployment = data[projectId]
      const project = projects[projectId]

      if (deployment && project) {
        const { title } = project
        const { point, rotation } = deployment.placement
        const deployedParcels = getParcelOrientation(project, point, rotation)
        for (let coordinate of deployedParcels) {
          const { x, y } = coordinate
          out[`${x},${y}`] = { x, y, title, projectId }
        }
      }
    }
    return out
  }
)
