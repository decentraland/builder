import {
  RecordMediaRequestAction,
  RECORD_MEDIA_SUCCESS,
  RecordMediaSuccessAction,
  RECORD_MEDIA_REQUEST,
  RecordMediaProgressAction,
  RECORD_MEDIA_PROGRESS
} from './actions'
import { Media } from './types'

export type MediaState = {
  media: Media | null
  progress: number
}

const INITIAL_STATE: MediaState = {
  media: null,
  progress: 0
}

export type MediaReducerAction = RecordMediaRequestAction | RecordMediaSuccessAction | RecordMediaProgressAction

export const mediaReducer = (state = INITIAL_STATE, action: MediaReducerAction): MediaState => {
  switch (action.type) {
    case RECORD_MEDIA_SUCCESS: {
      const { north, east, south, west, preview } = action.payload.media

      if (state.media) {
        Object.values(state.media).forEach(url => window.URL.revokeObjectURL(url))
      }

      return {
        ...state,
        media: {
          north: window.URL.createObjectURL(north!),
          east: window.URL.createObjectURL(east!),
          south: window.URL.createObjectURL(south!),
          west: window.URL.createObjectURL(west!),
          preview: window.URL.createObjectURL(preview!)
        },
        progress: 0
      }
    }
    case RECORD_MEDIA_REQUEST: {
      return {
        ...state,
        media: null
      }
    }
    case RECORD_MEDIA_PROGRESS: {
      return {
        ...state,
        progress: action.payload.progress
      }
    }
    default:
      return state
  }
}
