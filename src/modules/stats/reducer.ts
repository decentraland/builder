import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchWeeklySceneStatsFailureAction,
  FetchWeeklySceneStatsRequestAction,
  FetchWeeklySceneStatsSuccessAction,
  FETCH_WEEKLY_SCENE_STATS_FAILURE,
  FETCH_WEEKLY_SCENE_STATS_REQUEST,
  FETCH_WEEKLY_SCENE_STATS_SUCCESS
} from './action'
import { WeeklyStats } from './types'

const INITIAL_STATE: StatsState = {
  data: {
    weekly: {}
  },
  loading: [],
  error: null
}

export type StatsState = {
  data: {
    weekly: Record<string, WeeklyStats | null>
  }
  loading: LoadingState
  error: string | null
}

type StatsReducerAction = FetchWeeklySceneStatsRequestAction | FetchWeeklySceneStatsFailureAction | FetchWeeklySceneStatsSuccessAction

export function statsReducer(state = INITIAL_STATE, action: StatsReducerAction) {
  switch (action.type) {
    case FETCH_WEEKLY_SCENE_STATS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case FETCH_WEEKLY_SCENE_STATS_SUCCESS: {
      const { base, stats } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [base]: stats
        }
      }
    }

    case FETCH_WEEKLY_SCENE_STATS_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }

    default:
      return state
  }
}
