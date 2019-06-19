import { RootState } from 'modules/common/types'
import { ProgressStage } from './types'

export const getState = (state: RootState) => state.deployment
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getError = (state: RootState) => getState(state).error
export const getProgress = (state: RootState) => getState(state).data.progress
export const getLocalCID = (state: RootState) => getState(state).data.localCID
export const getRemoteCID = (state: RootState) => getState(state).data.remoteCID
export const isRecording = (state: RootState) => getState(state).data.progress.stage === ProgressStage.RECORD
export const isUploadingRecording = (state: RootState) => getState(state).data.progress.stage === ProgressStage.UPLOAD_RECORDING
export const isUploadingAssets = (state: RootState) => getState(state).data.progress.stage === ProgressStage.UPLOAD_SCENE_ASSETS
