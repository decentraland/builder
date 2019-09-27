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
  saveAssetPackSuccess,
  loadAssetPacksRequest,
  DELETE_ASSET_PACK_REQUEST,
  DeleteAssetPackRequestAction,
  deleteAssetPackFailure,
  deleteAssetPackSuccess
} from 'modules/assetPack/actions'
import { store } from 'modules/common/store'
import { getProgress } from 'modules/assetPack/selectors'
import { FullAssetPack, ProgressStage } from 'modules/assetPack/types'
import { builder } from 'lib/api/builder'
import { fixAssetMappings } from 'modules/scene/actions'
import { isRemoteURL } from 'modules/media/utils'
import { selectAssetPack, selectCategory } from 'modules/ui/sidebar/actions'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
  yield takeLatest(SAVE_ASSET_PACK_REQUEST, handleSaveAssetPack)
  yield takeLatest(DELETE_ASSET_PACK_REQUEST, handleDeleteAssetPack)
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
    yield put(fixAssetMappings())
  } catch (error) {
    yield put(loadAssetPacksFailure(error.message))
  }
}

function* handleSaveAssetPack(action: SaveAssetPackRequestAction) {
  const { assetPack, contents } = action.payload

  try {
    yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 0))
    yield call(() => builder.saveAssetPack(assetPack))

    yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 50))

    if (!isRemoteURL(assetPack.thumbnail)) {
      yield call(() => builder.saveAssetPackThumbnail(assetPack))
    }

    yield put(setProgress(ProgressStage.CREATE_ASSET_PACK, 100))

    yield put(setProgress(ProgressStage.UPLOAD_CONTENTS, 0))

    const updatableAssets = assetPack.assets.filter(asset => Object.keys(contents[asset.id]).length > 0)
    const onProgress = handleAssetContentsUploadProgress(updatableAssets.length)
    const uploadEffects = updatableAssets.map(asset => call(() => builder.saveAssetContents(asset, contents[asset.id]).then(onProgress)))

    if (uploadEffects.length > 0) {
      yield all(uploadEffects)
    } else {
      yield put(setProgress(ProgressStage.UPLOAD_CONTENTS, 100))
    }

    yield put(saveAssetPackSuccess(assetPack))
    yield put(setProgress(ProgressStage.NONE, 0))
    yield put(loadAssetPacksRequest())
  } catch (e) {
    yield put(saveAssetPackFailure(assetPack, e.message))
  }
}

function* handleDeleteAssetPack(action: DeleteAssetPackRequestAction) {
  const { assetPack } = action.payload

  try {
    yield call(() => builder.deleteAssetPack(assetPack))
    yield put(deleteAssetPackSuccess(assetPack))
    yield put(selectAssetPack(null))
    yield put(selectCategory(null))
  } catch (e) {
    yield put(deleteAssetPackFailure(assetPack, e.message))
  }
}
