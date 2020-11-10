import { action } from 'typesafe-actions'
import { WeeklyStats } from './types'

// Fetch Stats

export const FETCH_SCENE_STATS_REQUEST = '[Request] Fetch scene stats'
export const FETCH_SCENE_STATS_SUCCESS = '[Success] Fetch scene stats'
export const FETCH_SCENE_STATS_FAILURE = '[Failure] Fetch scene stats'

export const fetchSceneStatsRequest = (base: string) => action(FETCH_SCENE_STATS_REQUEST, { base })
export const fetchSceneStatsSuccess = (base: string, stats: WeeklyStats | null) => action(FETCH_SCENE_STATS_SUCCESS, { base, stats })
export const fetchSceneStatsFailure = (base: string, error: string) => action(FETCH_SCENE_STATS_FAILURE, { base, error })

export type FetchSceneStatsRequestAction = ReturnType<typeof fetchSceneStatsRequest>
export type FetchSceneStatsSuccessAction = ReturnType<typeof fetchSceneStatsSuccess>
export type FetchSceneStatsFailureAction = ReturnType<typeof fetchSceneStatsFailure>
