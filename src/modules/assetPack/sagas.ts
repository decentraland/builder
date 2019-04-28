import { call, put, takeLatest, select } from 'redux-saga/effects'

import {
  LOAD_ASSET_PACKS_REQUEST,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction
} from 'modules/assetPack/actions'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { getAvailableAssetPackIds } from 'modules/ui/sidebar/selectors'
import { BaseAssetPack, FullAssetPack } from 'modules/assetPack/types'
import { setAvailableAssetPacks, setNewAssetPacks } from 'modules/ui/sidebar/actions'
import { api } from 'lib/api'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
}

function* handleLoadAssetPacks(_: LoadAssetPacksRequestAction) {
  try {
    const remoteAssetPacks: BaseAssetPack[] = yield call(() => api.fetchAssetPacks())

    // Asset pack ids available last time the user visited
    const previousAvailableAssetPackIds: ReturnType<typeof getAvailableAssetPackIds> = yield select(getAvailableAssetPackIds)

    // Current available asset packs
    const currentAvailableAssetPackIds = remoteAssetPacks.map(assetPack => assetPack.id)

    // New asset packs since last visit
    const newAssetPackIds = []
    for (const assetPackId of currentAvailableAssetPackIds) {
      if (!previousAvailableAssetPackIds.includes(assetPackId)) {
        newAssetPackIds.push(assetPackId)
      }
    }

    // Update the available asset packs in state
    yield put(setAvailableAssetPacks(currentAvailableAssetPackIds))

    // Update the new asset packs in state
    yield put(setNewAssetPacks(newAssetPackIds))

    // Get asset pack list
    const assetPacks: FullAssetPack[] = []
    for (const remoteAssetPack of remoteAssetPacks) {
      const assetPacksInState: ReturnType<typeof getAssetPacks> = yield select(getAssetPacks)
      const assetPackInState = assetPacksInState[remoteAssetPack.id]
      // Check if the asset pack not in the state or is not loaded and if so, fetch it
      if (!assetPackInState || !assetPackInState.isLoaded) {
        const assetPack: FullAssetPack = yield call(() => api.fetchAssetPack(remoteAssetPack.id))
        assetPacks.push({
          // Add the fetched asset pack and mark it as loaded
          ...assetPack,
          isLoaded: true,
          assets: assetPack.assets.map(asset => ({
            ...asset,
            url: `${remoteAssetPack.id}/${asset.url}`,
            assetPackId: remoteAssetPack.id,
            id: asset.id
          }))
        })
      } else {
        // If the asset pack is already loaded use the data from state
        const assetsInState: ReturnType<typeof getAssets> = yield select(getAssets)
        assetPacks.push({
          ...assetPackInState,
          assets: assetPackInState.assets.map(assetId => assetsInState[assetId])
        })
      }
    }
    // Success
    yield put(loadAssetPacksSuccess(assetPacks))
  } catch (error) {
    yield put(loadAssetPacksFailure(error.message))
  }
}
