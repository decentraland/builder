import { RootState } from 'modules/common/types'
import { createSelector } from 'reselect'
import { MediaState } from './reducer'
import { Media } from './types'

export const getState = (state: RootState) => state.media
export const getData = (state: RootState) => getState(state).data
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getMediaByCID = (cid: string) =>
  createSelector<RootState, MediaState['data'], Media>(
    getData,
    data => data[cid]
  )
