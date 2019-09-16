import { call, put, takeLatest } from 'redux-saga/effects'

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
import { getProgress } from 'modules/assetPack/selectors'
import { FullAssetPack, ProgressStage } from 'modules/assetPack/types'
import { builder } from 'lib/api/builder'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
  yield takeLatest(SAVE_ASSET_PACK_REQUEST, handleSaveAssetPack)
}

const handleAssetContentsUploadProgress = (total: number) => () => {
  // Set to 100 when the last asset is loaded (otherwise we can end with a 99/100 situation)
  const existingProgress = getProgress(store.getState() as any)
  const isLast = existingProgress.value === ((((total - 1) / total) * 100) | 0)
  const progress = !isLast ? (existingProgress.value + (1 / total) * 100) | 0 : 100
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
