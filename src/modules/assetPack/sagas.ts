import uuidv4 from 'uuid/v4'
import { call, put, takeLatest } from 'redux-saga/effects'
import {
  LOAD_ASSET_PACKS_REQUEST,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction,
  LOAD_ASSET_PACKS_SUCCESS
} from 'modules/assetPack/actions'
import { RemoteAssetPack, FullAssetPack } from 'modules/assetPack/types'
import { api } from 'lib/api'
import { startEditor } from 'modules/editor/actions'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
  yield takeLatest(LOAD_ASSET_PACKS_SUCCESS, handleLoadAssetPacksSuccess)
}

function* handleLoadAssetPacks(action: LoadAssetPacksRequestAction) {
  try {
    // TODO: This should fetch a list of asset packs in the future, this is just a mock for now
    const remoteAssetPack: RemoteAssetPack = yield call(() => api.fetchAssetPack('packv1.json'))
    const remoteAssetPacks = [remoteAssetPack]

    const assetPacks: FullAssetPack[] = []

    // Generate unique uuids for internal use
    for (const remoteAssetPack of remoteAssetPacks) {
      const assetPack: FullAssetPack = {
        ...remoteAssetPack,
        assets: remoteAssetPack.assets.map(asset => ({
          ...asset,
          url: `${remoteAssetPack.id}/${asset.url}`,
          assetPackId: remoteAssetPack.id,
          id: uuidv4()
        }))
      }

      assetPacks.push(assetPack)
    }

    yield put(loadAssetPacksSuccess(assetPacks))
  } catch (error) {
    yield put(loadAssetPacksFailure(error.message))
  }
}

function* handleLoadAssetPacksSuccess() {
  // TODO: this call should only be done the first time when the editor starts
  yield put(startEditor())
}
