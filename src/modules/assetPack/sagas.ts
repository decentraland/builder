import { call, put, takeLatest, select } from 'redux-saga/effects'

import {
  LOAD_ASSET_PACKS_REQUEST,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction,
  SaveAssetPackRequestAction,
  SAVE_ASSET_PACK_REQUEST,
  setProgress
} from 'modules/assetPack/actions'
import { store } from 'modules/common/store'
import { getData as getAssetPacks, getProgress } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { getAvailableAssetPackIds } from 'modules/ui/sidebar/selectors'
import { BaseAssetPack, FullAssetPack, ProgressStage } from 'modules/assetPack/types'
import { setAvailableAssetPacks, setNewAssetPacks } from 'modules/ui/sidebar/actions'
import { builder } from 'lib/api/builder'
import { assets } from 'lib/api/assets'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
  yield takeLatest(SAVE_ASSET_PACK_REQUEST, handleSaveAssetPack)
}

function* handleLoadAssetPacks(_: LoadAssetPacksRequestAction) {
  try {
    const remoteAssetPacks: BaseAssetPack[] = yield call(() => assets.fetchAssetPacks())

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
        const assetPack: FullAssetPack = yield call(() => assets.fetchAssetPack(remoteAssetPack.id))
        assetPacks.push({
          // Add the fetched asset pack and mark it as loaded
          ...remoteAssetPack,
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

function* handleSaveAssetPack(action: SaveAssetPackRequestAction) {
  const { assetPack, contents } = action.payload
  const total = assetPack.assets.length

  yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 0))
  yield call(() => builder.saveAssetPack(assetPack))
  yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 50))
  yield call(() => builder.saveAssetPackThumbnail(assetPack))
  yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 100))

  yield put(setProgress(ProgressStage.UPLOAD_CONTENTS, 0))
  for (let asset of assetPack.assets) {
    yield call(() => builder.saveAssetContents(asset, contents[asset.id], handleAssetContentsUploadProgress(total)))
  }
}

const handleAssetContentsUploadProgress = (total: number) => () => {
  // Set to 100 when the last asset is loaded (otherwise we can end with a 99/100 situation)
  const existingProgress = getProgress(store.getState() as any)
  const isLast = existingProgress.value === ((((total - 1) / total) * 100) | 0)
  const progress = !isLast ? (existingProgress.value + (1 / total) * 100) | 0 : 100
  store.dispatch(setProgress(ProgressStage.UPLOAD_CONTENTS, progress))
}
