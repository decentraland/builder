import { action } from 'typesafe-actions'
import { WorldsWalletStats } from 'lib/api/worlds'

// Fetch Worlds Wallet Stats
export const FETCH_WORLDS_WALLET_STATS_REQUEST = '[Request] Fetch Worlds Wallet Stats'
export const FETCH_WORLDS_WALLET_STATS_SUCCESS = '[Success] Fetch Worlds Wallet Stats'
export const FETCH_WORLDS_WALLET_STATS_FAILURE = '[Failure] Fetch Worlds Wallet Stats'

export const fetchWorldsWalletStatsRequest = (address: string) => action(FETCH_WORLDS_WALLET_STATS_REQUEST, { address })
export const fetchWorldsWalletStatsSuccess = (address: string, stats: WorldsWalletStats) =>
  action(FETCH_WORLDS_WALLET_STATS_SUCCESS, { address, stats })
export const fetchWorldsWalletStatsFailure = (address: string, error: string) =>
  action(FETCH_WORLDS_WALLET_STATS_FAILURE, { address, error })

export type FetchWalletWorldsStatsRequestAction = ReturnType<typeof fetchWorldsWalletStatsRequest>
export type FetchWalletWorldsStatsSuccessAction = ReturnType<typeof fetchWorldsWalletStatsSuccess>
export type FetchWalletWorldsStatsFailureAction = ReturnType<typeof fetchWorldsWalletStatsFailure>
