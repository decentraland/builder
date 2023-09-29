import { action } from 'typesafe-actions'
import { WalletStats } from 'lib/api/worlds'

// Fetch Wallet Worlds Stats
export const FETCH_WALLET_WORLDS_STATS_REQUEST = '[Request] Fetch Wallet Worlds Stats'
export const FETCH_WALLET_WORLDS_STATS_SUCCESS = '[Success] Fetch Wallet Worlds Stats'
export const FETCH_WALLET_WORLDS_STATS_FAILURE = '[Failure] Fetch Wallet Worlds Stats'

export const fetchWalletWorldsStatsRequest = (address: string) => action(FETCH_WALLET_WORLDS_STATS_REQUEST, { address })
export const fetchWalletWorldsStatsSuccess = (address: string, stats: WalletStats) =>
  action(FETCH_WALLET_WORLDS_STATS_SUCCESS, { address, stats })
export const fetchWalletWorldsStatsFailure = (address: string, error: string) =>
  action(FETCH_WALLET_WORLDS_STATS_FAILURE, { address, error })

export type FetchWalletWorldsStatsRequestAction = ReturnType<typeof fetchWalletWorldsStatsRequest>
export type FetchWalletWorldsStatsSuccessAction = ReturnType<typeof fetchWalletWorldsStatsSuccess>
export type FetchWalletWorldsStatsFailureAction = ReturnType<typeof fetchWalletWorldsStatsFailure>
