import { call, put, takeLatest, select } from 'redux-saga/effects'

import {
  LOAD_ASSET_PACKS_REQUEST,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction
} from 'modules/assetPack/actions'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { getSelectedAssetPackIds, getAvailableAssetPackIds } from 'modules/ui/sidebar/selectors'
import { BaseAssetPack, FullAssetPack } from 'modules/assetPack/types'
import { api } from 'lib/api'
import { setAvailableAssetPacks } from 'modules/ui/sidebar/actions'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
}

function* handleLoadAssetPacks(_: LoadAssetPacksRequestAction) {
  try {
    const remoteAssetPacks: BaseAssetPack[] = yield call(() => api.fetchAssetPacks())

    // Asset pack ids available last time the user visited
    const previousAvailableAssetPackIds: ReturnType<typeof getAvailableAssetPackIds> = yield select(getAvailableAssetPackIds)

    // Fresh available asset packs
    const newAvailableAssetPackIds = remoteAssetPacks.map(assetPack => assetPack.id)

    // Update the available asset packs in state
    yield put(setAvailableAssetPacks(newAvailableAssetPackIds))

    // Get user selection of asset packs
    const selectedAssetPackIds: ReturnType<typeof getSelectedAssetPackIds> = yield select(getSelectedAssetPackIds)
    const assetPackSelection = new Set(selectedAssetPackIds)

    const assetPacks: FullAssetPack[] = []
    for (const remoteAssetPack of remoteAssetPacks) {
      // Check if the asset pack is selected
      if (assetPackSelection.has(remoteAssetPack.id)) {
        const assetPacksInState: ReturnType<typeof getAssetPacks> = yield select(getAssetPacks)
        const assetPackInState = assetPacksInState[remoteAssetPack.id]
        // Check if the asset pack not in the state or is not loaded and if so, fetch it
        if (!assetPackInState || !assetPackInState.isLoaded) {
          const assetPack: FullAssetPack = yield call(() => api.fetchAssetPack(remoteAssetPack.id))
          assetPacks.push({
            // Add the fetched asset pack and mark it as loaded
            ...remoteAssetPack, // TODO: we can remove this once the `thumbnail` and `url` are added to the individual asset packs
            ...assetPack,
            isNew: false,
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
      } else {
        // If the asset pack is not selected then just add the remote asset pack and mark is as not loaded
        assetPacks.push({
          ...remoteAssetPack,
          isNew: false,
          isLoaded: false,
          assets: []
        })
      }
    }

    // Mark new asset packs as new
    if (previousAvailableAssetPackIds.length > 0) {
      // This are the asset packs the user has seen already
      const oldAssetPacks = new Set(previousAvailableAssetPackIds)
      for (const assetPack of assetPacks) {
        assetPack.isNew = !oldAssetPacks.has(assetPack.id)
      }
    }

    yield put(loadAssetPacksSuccess(assetPacks))
  } catch (error) {
    yield put(loadAssetPacksFailure(error.message))
  }
}
