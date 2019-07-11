import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { Media } from './types'

export const getState = (state: RootState) => state.media
export const getMedia = (state: RootState) => getState(state).media
export const getProgress = (state: RootState) => getState(state).progress

export const isRecording = createSelector<RootState, Media | null, number, boolean>(
  getMedia,
  getProgress,
  (media, progress) => !media && progress > 0
)
