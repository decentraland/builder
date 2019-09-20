import { call, put, takeLatest, all } from 'redux-saga/effects'

import {
  LOAD_ASSET_PACKS_REQUEST,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction,
  SaveAssetPackRequestAction,
  SAVE_ASSET_PACK_REQUEST,
  setProgress,
  saveAssetPackFailure,
  saveAssetPackSuccess
} from 'modules/assetPack/actions'
import { store } from 'modules/common/store'
import { getProgress } from 'modules/assetPack/selectors'
import { FullAssetPack, ProgressStage } from 'modules/assetPack/types'
import { builder } from 'lib/api/builder'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
  yield takeLatest(SAVE_ASSET_PACK_REQUEST, handleSaveAssetPack)
}

const handleAssetContentsUploadProgress = (total: number) => () => {
  // Calculate the increment step, it will be truncated
  const increment = ((1 / total) * 100) | 0
  // Get the existing progress
  const existingProgress = getProgress(store.getState() as any)
  // Calculate the current file based on the existing progress
  const currentFile = existingProgress.value / increment + 1
  // Calculate the new value based on the existing progress and the increment
  const newValue = existingProgress.value + increment
  // If this is the last file, just map it to 100
  const progress = currentFile !== total ? newValue : 100

  store.dispatch(setProgress(ProgressStage.UPLOAD_CONTENTS, progress))
}

function* handleLoadAssetPacks(_: LoadAssetPacksRequestAction) {
  try {
    const assetPacks: FullAssetPack[] = yield call(() => builder.fetchAssetPacks())
    yield put(loadAssetPacksSuccess(assetPacks))
  } catch (error) {
    yield put(loadAssetPacksFailure(error.message))
  }
}

function* handleSaveAssetPack(action: SaveAssetPackRequestAction) {
  const { assetPack, contents } = action.payload
  const total = assetPack.assets.length

  debugger

  try {
    yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 0))
    yield call(() => builder.saveAssetPack(assetPack))
    debugger
    yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 50))
    if (assetPack.thumbnail.startsWith('data:')) {
      yield call(() => builder.saveAssetPackThumbnail(assetPack))
    }
    debugger
    yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 100))

    yield put(setProgress(ProgressStage.UPLOAD_CONTENTS, 0))
    yield all(
      assetPack.assets.flatMap(asset => [
        call(() => builder.saveAssetContents(asset, contents[asset.id])),
        call(handleAssetContentsUploadProgress(total))
      ])
    )
    debugger
    yield put(saveAssetPackSuccess(assetPack))
  } catch (e) {
    yield put(saveAssetPackFailure(assetPack, e.message))
  }
}
