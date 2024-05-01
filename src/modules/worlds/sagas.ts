import { call, put, select, takeEvery } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { loadProfileRequest, loadProfilesRequest } from 'decentraland-dapps/dist/modules/profile'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { WorldsWalletStats, WorldsAPI, WorldPermissions, WorldPermissionType } from 'lib/api/worlds'
import {
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  GET_WORLD_PERMISSIONS_REQUEST,
  POST_WORLD_PERMISSIONS_REQUEST,
  PUT_WORLD_PERMISSIONS_REQUEST,
  DELETE_WORLD_PERMISSIONS_REQUEST,
  FetchWalletWorldsStatsRequestAction,
  fetchWorldsWalletStatsFailure,
  fetchWorldsWalletStatsRequest,
  fetchWorldsWalletStatsSuccess,
  GetWorldPermissionsRequestAction,
  getWorldPermissionsSuccess,
  postWorldPermissionsSuccess,
  postWorldPermissionsFailure,
  PutWorldPermissionsRequestAction,
  PostWorldPermissionsRequestAction,
  putWorldPermissionsSuccess,
  putWorldPermissionsFailure,
  DeleteWorldPermissionsRequestAction,
  deleteWorldPermissionsSuccess,
  deleteWorldPermissionsFailure,
  getWorldPermissionsFailure
} from './actions'
import { CLEAR_DEPLOYMENT_SUCCESS, DEPLOY_TO_WORLD_SUCCESS } from 'modules/deployment/actions'

export function* worldsSaga(WorldsAPIContent: WorldsAPI) {
  yield takeEvery(FETCH_WORLDS_WALLET_STATS_REQUEST, handleFetchWorldsWalletStatsRequest)
  yield takeEvery(
    [CONNECT_WALLET_SUCCESS, DEPLOY_TO_WORLD_SUCCESS, CLEAR_DEPLOYMENT_SUCCESS],
    handleActionsThatTriggerFetchWorldsWalletStatsRequest
  )
  yield takeEvery(GET_WORLD_PERMISSIONS_REQUEST, handleGetWorldPermissionsRequest)
  yield takeEvery(POST_WORLD_PERMISSIONS_REQUEST, handlePostWorldPermissionsRequest)
  yield takeEvery(PUT_WORLD_PERMISSIONS_REQUEST, handlePutWorldPermissionsRequest)
  yield takeEvery(DELETE_WORLD_PERMISSIONS_REQUEST, handleDeleteWorldPermissionsRequest)

  function* handleFetchWorldsWalletStatsRequest(action: FetchWalletWorldsStatsRequestAction) {
    const { address } = action.payload

    try {
      const stats: WorldsWalletStats | null = yield call([WorldsAPIContent, WorldsAPIContent.fetchWalletStats], address)

      if (!stats) {
        throw new Error('Could not fetch wallet stats')
      }

      yield put(fetchWorldsWalletStatsSuccess(address, stats))
    } catch (e) {
      yield put(fetchWorldsWalletStatsFailure(address, isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleActionsThatTriggerFetchWorldsWalletStatsRequest() {
    const address: string | undefined = yield select(getAddress)

    if (!address) {
      return
    }

    yield put(fetchWorldsWalletStatsRequest(address))
  }

  function* handleGetWorldPermissionsRequest(action: GetWorldPermissionsRequestAction) {
    const { worldName } = action.payload
    try {
      const worldPermissions: WorldPermissions | null = yield call(WorldsAPIContent.getPermissions, worldName)
      if (!worldPermissions) {
        throw new Error('Could not fetch world permissions')
      }

      let newWallets: string[] = []

      if (worldPermissions.access.type === WorldPermissionType.AllowList) {
        newWallets = [...newWallets, ...worldPermissions.access.wallets]
      }
      if (worldPermissions.deployment.type === WorldPermissionType.AllowList) {
        newWallets = [...newWallets, ...worldPermissions.deployment.wallets]
      }
      if (worldPermissions.streaming.type === WorldPermissionType.AllowList) {
        newWallets = [...newWallets, ...worldPermissions.streaming.wallets]
      }

      if (newWallets.length > 0) {
        yield put(loadProfilesRequest([...new Set(newWallets)]))
      }

      yield put(getWorldPermissionsSuccess(worldName, worldPermissions))
    } catch (error) {
      yield put(getWorldPermissionsFailure(worldName, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handlePostWorldPermissionsRequest(action: PostWorldPermissionsRequestAction) {
    const { worldName, worldPermissionNames, worldPermissionType } = action.payload
    try {
      const hasUpdatedPermissions: boolean | null = yield call(
        WorldsAPIContent.postPermissionType,
        worldName,
        worldPermissionNames,
        worldPermissionType
      )

      if (!hasUpdatedPermissions) {
        throw new Error(`Couldn't update permission type`)
      }

      yield put(postWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType))
    } catch (e) {
      yield put(postWorldPermissionsFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handlePutWorldPermissionsRequest(action: PutWorldPermissionsRequestAction) {
    const { worldName, worldPermissionNames, worldPermissionType, newData } = action.payload
    try {
      const hasAddedWallet: boolean | null = yield call(WorldsAPIContent.putPermissionType, worldName, worldPermissionNames, newData)

      if (!hasAddedWallet) {
        throw new Error(`Couldn't add address`)
      }

      yield put(putWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType, newData))
      yield put(loadProfileRequest(newData))
    } catch (e) {
      yield put(putWorldPermissionsFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleDeleteWorldPermissionsRequest(action: DeleteWorldPermissionsRequestAction) {
    const { worldName, worldPermissionNames, worldPermissionType, address } = action.payload
    try {
      const hasDeletedPermissions: boolean | null = yield call(
        WorldsAPIContent.deletePermissionType,
        worldName,
        worldPermissionNames,
        address
      )

      if (!hasDeletedPermissions) {
        throw new Error(`Couldn't delete address`)
      }

      yield put(deleteWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType, address))
    } catch (e) {
      yield put(deleteWorldPermissionsFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }
}
