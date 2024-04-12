import { call, put, select, takeEvery } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { WorldsWalletStats, WorldsAPI, WorldPermissions, WorldPermissionType } from 'lib/api/worlds'
import { getCatalystProfiles } from 'lib/api/peer'
import {
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  GET_WORLD_PERMISSIONS_REQUEST,
  POST_WORLD_PERMISSIONS_REQUEST,
  PUT_WORLD_PERMISSIONS_REQUEST,
  DELETE_WORLD_PERMISSIONS_REQUEST,
  GET_PROFILES_REQUEST,
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
  GetProfilesRequestAction,
  getProfilesRequest,
  getProfilesSuccess,
  getProfilesFailure
} from './actions'
import { CLEAR_DEPLOYMENT_SUCCESS, DEPLOY_TO_WORLD_SUCCESS } from 'modules/deployment/actions'
import { Avatar } from '@dcl/schemas/dist/platform/profile/avatar'

export function* worldsSaga(WorldsAPIContent: WorldsAPI) {
  yield takeEvery(FETCH_WORLDS_WALLET_STATS_REQUEST, handlefetchWorldsWalletStatsRequest)
  yield takeEvery(
    [CONNECT_WALLET_SUCCESS, DEPLOY_TO_WORLD_SUCCESS, CLEAR_DEPLOYMENT_SUCCESS],
    handleActionsThatTriggerFetchWorldsWalletStatsRequest
  )
  yield takeEvery(GET_WORLD_PERMISSIONS_REQUEST, handleGetWorldPermissionsRequest)
  yield takeEvery(POST_WORLD_PERMISSIONS_REQUEST, handlePostWorldPermissionsRequest)
  yield takeEvery(PUT_WORLD_PERMISSIONS_REQUEST, handlePutWorldPermissionsRequest)
  yield takeEvery(DELETE_WORLD_PERMISSIONS_REQUEST, handleDeleteWorldPermissionsRequest)
  yield takeEvery(GET_PROFILES_REQUEST, handleGetProfilesRequest)

  function* handlefetchWorldsWalletStatsRequest(action: FetchWalletWorldsStatsRequestAction) {
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
    const worldPremissions: WorldPermissions | null = yield call(WorldsAPIContent.getPermissions, worldName)
    if (!worldPremissions) {
      return
    }

    let newWallets: string[] = []

    if (worldPremissions.access.type === WorldPermissionType.AllowList) {
      newWallets = [...newWallets, ...worldPremissions.access.wallets]
    }
    if (worldPremissions.deployment.type === WorldPermissionType.AllowList) {
      newWallets = [...newWallets, ...worldPremissions.deployment.wallets]
    }
    if (worldPremissions.streaming.type === WorldPermissionType.AllowList) {
      newWallets = [...newWallets, ...worldPremissions.streaming.wallets]
    }

    if (newWallets.length > 0) {
      yield put(getProfilesRequest(newWallets))
    }

    yield put(getWorldPermissionsSuccess(worldName, worldPremissions))
  }

  function* handlePostWorldPermissionsRequest(action: PostWorldPermissionsRequestAction) {
    const { worldName, worldPermissionNames, worldPermissionType } = action.payload
    try {
      const worldPremissions: boolean | null = yield call(
        WorldsAPIContent.postPermissionType,
        worldName,
        worldPermissionNames,
        worldPermissionType
      )

      if (!worldPremissions) {
        return
      }

      yield put(postWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType))
    } catch (e) {
      yield put(
        postWorldPermissionsFailure(
          worldName,
          worldPermissionNames,
          worldPermissionType,
          isErrorWithMessage(e) ? e.message : 'Unknown error'
        )
      )
    }
  }

  function* handlePutWorldPermissionsRequest(action: PutWorldPermissionsRequestAction) {
    const { worldName, worldPermissionNames, worldPermissionType, newData } = action.payload
    try {
      const worldPremissions: boolean | null = yield call(WorldsAPIContent.putPermissionType, worldName, worldPermissionNames, newData)

      if (!worldPremissions) {
        return
      }

      yield put(putWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType, newData))
      yield put(getProfilesRequest([newData]))
    } catch (e) {
      yield put(
        putWorldPermissionsFailure(
          worldName,
          worldPermissionNames,
          worldPermissionType,
          newData,
          isErrorWithMessage(e) ? e.message : 'Unknown error'
        )
      )
    }
  }

  function* handleDeleteWorldPermissionsRequest(action: DeleteWorldPermissionsRequestAction) {
    const { worldName, worldPermissionNames, worldPermissionType, address } = action.payload
    try {
      const worldPremissions: boolean | null = yield call(WorldsAPIContent.deletePermissionType, worldName, worldPermissionNames, address)

      if (!worldPremissions) {
        return
      }

      yield put(deleteWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType, address))
    } catch (e) {
      yield put(
        deleteWorldPermissionsFailure(
          worldName,
          worldPermissionNames,
          worldPermissionType,
          address,
          isErrorWithMessage(e) ? e.message : 'Unknown error'
        )
      )
    }
  }

  function* handleGetProfilesRequest(action: GetProfilesRequestAction) {
    const { wallets } = action.payload
    try {
      const profiles: Avatar[] = yield call(getCatalystProfiles, wallets)

      yield put(getProfilesSuccess(profiles))
    } catch (e) {
      yield put(getProfilesFailure(wallets, isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }
}
