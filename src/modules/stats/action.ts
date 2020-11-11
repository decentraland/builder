import { action } from 'typesafe-actions'
import { WeeklyStats } from './types'

// Fetch Stats

export const FETCH_WEEKLY_SCENE_STATS_REQUEST = '[Request] Fetch weekly scene stats'
export const FETCH_WEEKLY_SCENE_STATS_SUCCESS = '[Success] Fetch weekly scene stats'
export const FETCH_WEEKLY_SCENE_STATS_FAILURE = '[Failure] Fetch weekly scene stats'

export const fetchWeeklySceneStatsRequest = (base: string) => action(FETCH_WEEKLY_SCENE_STATS_REQUEST, { base })
export const fetchWeeklySceneStatsSuccess = (base: string, stats: WeeklyStats | null) =>
  action(FETCH_WEEKLY_SCENE_STATS_SUCCESS, { base, stats })
export const fetchWeeklySceneStatsFailure = (base: string, error: string) => action(FETCH_WEEKLY_SCENE_STATS_FAILURE, { base, error })

export type FetchWeeklySceneStatsRequestAction = ReturnType<typeof fetchWeeklySceneStatsRequest>
export type FetchWeeklySceneStatsSuccessAction = ReturnType<typeof fetchWeeklySceneStatsSuccess>
export type FetchWeeklySceneStatsFailureAction = ReturnType<typeof fetchWeeklySceneStatsFailure>
