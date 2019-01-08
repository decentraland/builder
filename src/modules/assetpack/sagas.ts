import { call, put, takeLatest } from 'redux-saga/effects'
import {
  LOAD_ASSET_PACKS_REQUEST,
  LOAD_ASSET_PACKS_SUCCESS,
  LOAD_ASSET_PACKS_FAILURE,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction
} from 'modules/assetPack/actions'
import { AssetPack } from 'modules/assetPack/types'
import { api } from 'lib/api'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
}

function* handleLoadAssetPacks(action: LoadAssetPacksRequestAction) {
  try {
    // TODO: This should fetch a list of asset packs in the future, this is just a mock for now
    const assetPack: AssetPack = yield call(() => api.fetchAssetPack('packv1.json'))
    const assetPacks = [assetPack]

    console.log(assetPack)

    yield put(loadAssetPacksSuccess(assetPacks))
  } catch (error) {
    yield put(loadAssetPacksFailure(error.message))
  }
}
