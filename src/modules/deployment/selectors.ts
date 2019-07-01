import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { getCurrentProject } from 'modules/project/selectors'
import { DeploymentState } from './reducer'
import { ProgressStage, DeploymentStatus, Deployment, Coordinate } from './types'
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

export const getDeployment = (projectId: string) =>
  createSelector<RootState, DeploymentState['data'], Deployment | null>(
    getData,
    data => {
      if (Object.keys(data).length === 0) return null
      return data[projectId]
    }
  )

export const getDeploymentStatus = (projectId: string) =>
  createSelector<RootState, DeploymentState['data'], DeploymentStatus>(
    getData,
    data => {
      if (Object.keys(data).length === 0) return DeploymentStatus.UNPUBLISHED
      const deployment = data[projectId]
      return getStatus(deployment)
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

export const getDeploymentsForMap = createSelector<RootState, DeploymentState['data'], Record<string, Coordinate>>(
  getData,
  data => {
    const out: Record<string, Coordinate> = {}
    for (let key in data) {
      const deployment = data[key]
      if (deployment) {
        const { x, y } = deployment.placement.point
        out[`${x},${y}`] = { x, y }
      }
    }
    return out
  }
)
