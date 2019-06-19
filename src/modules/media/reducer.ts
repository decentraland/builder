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
  cid: string | null // used a hash to check against and avoid taking new pictures
  media: Media | null
  progress: number
}

const INITIAL_STATE: MediaState = {
  cid: null,
  media: null,
  progress: 0
}

export type MediaReducerAction = RecordMediaRequestAction | RecordMediaSuccessAction | RecordMediaProgressAction

export const mediaReducer = (state = INITIAL_STATE, action: MediaReducerAction): MediaState => {
  switch (action.type) {
    case RECORD_MEDIA_SUCCESS: {
      return {
        ...state,
        media: action.payload.media
      }
    }
    case RECORD_MEDIA_REQUEST: {
      return {
        ...state,
        cid: action.payload.cid
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
