import { call, put, takeLatest } from 'redux-saga/effects'
import uuidv4 from 'uuid/v4'
import {
  LOAD_ASSET_PACKS_REQUEST,
  // @ts-ignore
  LOAD_ASSET_PACKS_SUCCESS,
  // @ts-ignore
  LOAD_ASSET_PACKS_FAILURE,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction
} from 'modules/assetPack/actions'
import { RemoteAssetPack, FullAssetPack } from 'modules/assetPack/types'
import { api } from 'lib/api'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
}

function* handleLoadAssetPacks(action: LoadAssetPacksRequestAction) {
  try {
    // TODO: This should fetch a list of asset packs in the future, this is just a mock for now
    const remoteAssetPack: RemoteAssetPack = yield call(() => api.fetchAssetPack('packv1.json'))
    const responseAssetPacks = [remoteAssetPack]

    const assetPacks: FullAssetPack[] = []

    // Generate unique uuids for internal use
    for (const remoteAssetPack of responseAssetPacks) {
      const assetPackId = uuidv4()

      const assetPack: FullAssetPack = {
        ...remoteAssetPack,
        id: uuidv4(),

        assets: remoteAssetPack.assets.map(asset => ({
          ...asset,
          assetPackId,
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
