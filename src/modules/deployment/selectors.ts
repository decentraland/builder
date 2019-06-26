import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { Project } from 'modules/project/types'
import { getCurrentProject } from 'modules/project/selectors'
import { DeploymentState } from './reducer'
import { ProgressStage, DeploymentStatus, Deployment } from './types'

export const getState = (state: RootState) => state.deployment
export const getData = (state: RootState) => state.deployment.data
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getError = (state: RootState) => getState(state).error
export const getProgress = (state: RootState) => getState(state).progress
export const isUploadingRecording = (state: RootState) => getState(state).progress.stage === ProgressStage.UPLOAD_RECORDING
export const isUploadingAssets = (state: RootState) => getState(state).progress.stage === ProgressStage.UPLOAD_SCENE_ASSETS
export const isCreatingFiles = (state: RootState) => getState(state).progress.stage === ProgressStage.CREATE_FILES
export const getRemoteCID = createSelector<RootState, DeploymentState['data'], Project | null, string | null>(
  getData,
  getCurrentProject,
  (data, project) => {
    if (!project || Object.keys(data).length === 0) return null
    return data[project.id].remoteCID
  }
)
export const getDeployment = createSelector<RootState, DeploymentState['data'], Project | null, Deployment | null>(
  getData,
  getCurrentProject,
  (data, project) => {
    if (!project || Object.keys(data).length === 0) return null
    return data[project.id]
  }
)
export const getDeploymentStatus = createSelector<RootState, DeploymentState['data'], Project | null, DeploymentStatus>(
  getData,
  getCurrentProject,
  (data, project) => {
    if (!project || Object.keys(data).length === 0) return DeploymentStatus.UNPUBLISHED

    const deployment = data[project.id]

    if (deployment.isDirty) return DeploymentStatus.NEEDS_SYNC
    if (deployment.remoteCID) return DeploymentStatus.PUBLISHED
    return DeploymentStatus.UNPUBLISHED
  }
)
