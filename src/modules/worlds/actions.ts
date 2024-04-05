import { action } from 'typesafe-actions'
import { WorldPermissionNames, WorldPermissionType, WorldPermissions, WorldsWalletStats } from 'lib/api/worlds'

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

// Get World Permissions
export const GET_WORLD_PERMISSIONS_REQUEST = '[Request] Get World Permissions'
export const GET_WORLD_PERMISSIONS_SUCCESS = '[Success] Get World Permissions'
export const GET_WORLD_PERMISSIONS_FAILURE = '[Failure] Get World Permissions'

export const getWorldPermissionsRequest = (worldName: string) => action(GET_WORLD_PERMISSIONS_REQUEST, { worldName })
export const getWorldPermissionsSuccess = (worldName: string, permissions: WorldPermissions) =>
  action(GET_WORLD_PERMISSIONS_SUCCESS, { worldName, permissions })
export const getWorldPermissionsFailure = (worldName: string, error: string) => action(GET_WORLD_PERMISSIONS_FAILURE, { worldName, error })

export type GetWorldPermissionsRequestAction = ReturnType<typeof getWorldPermissionsRequest>
export type GetWorldPermissionsSuccessAction = ReturnType<typeof getWorldPermissionsSuccess>
export type GetWorldPermissionsFailureAction = ReturnType<typeof getWorldPermissionsFailure>

// Post World Permissions Type
export const POST_WORLD_PERMISSIONS_REQUEST = '[Request] Post World Permissions'
export const POST_WORLD_PERMISSIONS_SUCCESS = '[Success] Post World Permissions'
export const POST_WORLD_PERMISSIONS_FAILURE = '[Failure] Post World Permissions'

export const postWorldPermissionsRequest = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType
) => action(POST_WORLD_PERMISSIONS_REQUEST, { worldName, worldPermissionNames, worldPermissionType })
export const postWorldPermissionsSuccess = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType
) => action(POST_WORLD_PERMISSIONS_SUCCESS, { worldName, worldPermissionNames, worldPermissionType })
export const postWorldPermissionsFailure = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType,
  error: string
) => action(POST_WORLD_PERMISSIONS_FAILURE, { worldName, worldPermissionNames, worldPermissionType, error })

export type PostWorldPermissionsRequestAction = ReturnType<typeof postWorldPermissionsRequest>
export type PostWorldPermissionsSuccessAction = ReturnType<typeof postWorldPermissionsSuccess>
export type PostWorldPermissionsFailureAction = ReturnType<typeof postWorldPermissionsFailure>

// Put World Permissions Type
export const PUT_WORLD_PERMISSIONS_REQUEST = '[Request] Put World Permissions'
export const PUT_WORLD_PERMISSIONS_SUCCESS = '[Success] Put World Permissions'
export const PUT_WORLD_PERMISSIONS_FAILURE = '[Failure] Put World Permissions'

export const putWorldPermissionsRequest = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
  newData: string
) => action(PUT_WORLD_PERMISSIONS_REQUEST, { worldName, worldPermissionNames, worldPermissionType, newData })
export const putWorldPermissionsSuccess = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
  newData: string
) => action(PUT_WORLD_PERMISSIONS_SUCCESS, { worldName, worldPermissionNames, worldPermissionType, newData })
export const putWorldPermissionsFailure = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
  newData: string,
  error: string
) => action(PUT_WORLD_PERMISSIONS_FAILURE, { worldName, worldPermissionNames, worldPermissionType, newData, error })

export type PutWorldPermissionsRequestAction = ReturnType<typeof putWorldPermissionsRequest>
export type PutWorldPermissionsSuccessAction = ReturnType<typeof putWorldPermissionsSuccess>
export type PutWorldPermissionsFailureAction = ReturnType<typeof putWorldPermissionsFailure>

// Delete World Permissions Type
export const DELETE_WORLD_PERMISSIONS_REQUEST = '[Request] Delete World Permissions'
export const DELETE_WORLD_PERMISSIONS_SUCCESS = '[Success] Delete World Permissions'
export const DELETE_WORLD_PERMISSIONS_FAILURE = '[Failure] Delete World Permissions'

export const deleteWorldPermissionsRequest = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
  newData: string
) => action(DELETE_WORLD_PERMISSIONS_REQUEST, { worldName, worldPermissionNames, worldPermissionType, newData })
export const deleteWorldPermissionsSuccess = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
  newData: string
) => action(DELETE_WORLD_PERMISSIONS_SUCCESS, { worldName, worldPermissionNames, worldPermissionType, newData })
export const deleteWorldPermissionsFailure = (
  worldName: string,
  worldPermissionNames: WorldPermissionNames,
  worldPermissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
  newData: string,
  error: string
) => action(DELETE_WORLD_PERMISSIONS_FAILURE, { worldName, worldPermissionNames, worldPermissionType, newData, error })

export type DeleteWorldPermissionsRequestAction = ReturnType<typeof deleteWorldPermissionsRequest>
export type DeleteWorldPermissionsSuccessAction = ReturnType<typeof deleteWorldPermissionsSuccess>
export type DeleteWorldPermissionsFailureAction = ReturnType<typeof deleteWorldPermissionsFailure>
