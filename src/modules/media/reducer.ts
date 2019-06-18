import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { Media } from './types'
import {
  RecordMediaRequestAction,
  RECORD_MEDIA_SUCCESS,
  RecordMediaSuccessAction,
  RecordMediaProgressAction,
  RECORD_MEDIA_PROGRESS
} from './actions'

export type MediaState = {
  data: DataByKey<Media>
  progress: number
  loading: LoadingState
}

const INITIAL_STATE: MediaState = {
  data: {},
  progress: 0,
  loading: []
}

export type MediaReducerAction = RecordMediaRequestAction | RecordMediaSuccessAction | RecordMediaProgressAction

export const mediaReducer = (state = INITIAL_STATE, action: MediaReducerAction): MediaState => {
  switch (action.type) {
    case RECORD_MEDIA_SUCCESS: {
      return {
        ...state,
        data: { ...state.data, [action.payload.cid]: action.payload.media }
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
