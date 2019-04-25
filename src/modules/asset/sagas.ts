import { call, put, takeLatest, actionChannel, take } from 'redux-saga/effects'
import { api } from 'lib/api'
import {
  LoadCollectiblesRequestAction,
  LOAD_COLLECTIBLES_REQUEST,
  loadCollectiblesSuccess,
  forceLoadCollectibleRequest,
  FORCE_LOAD_COLLECTIBLE_REQUEST,
  ForceLoadCollectibleRequestAction,
  forceLoadCollectibleSuccess
} from './actions'
import { Asset, RemoteCollectibleAssetResponse, RemoteCollectibleAsset } from './types'
import { CategoryName } from 'modules/ui/sidebar/utils'

export function* assetSaga() {
  yield takeLatest(LOAD_COLLECTIBLES_REQUEST, handleLoadCollectibles)
  const requestChan = yield actionChannel(FORCE_LOAD_COLLECTIBLE_REQUEST)

  while (true) {
    const action = yield take(requestChan)
    yield call(handleForceLoadCollectible, action)
  }
}

function* handleLoadCollectibles(action: LoadCollectiblesRequestAction) {
  const { owner, contract } = action.payload
  const response: RemoteCollectibleAssetResponse = yield call(() => api.fetchCollectibles(owner, contract))

  const assets: Asset[] = []

  for (let asset of response.assets) {
    if (asset.image_thumbnail_url) {
      assets.push({
        assetPackId: null,
        id: asset.token_id,
        tags: [],
        category: CategoryName.COLLECTIBLE_CATEGORY,
        variations: [],
        contents: {},
        name: asset.name,
        url: asset.external_link,
        thumbnail: asset.image_thumbnail_url
      })
    } else {
      yield put(forceLoadCollectibleRequest(contract, asset.token_id))
    }
  }

  yield put(loadCollectiblesSuccess(assets))
}

function* handleForceLoadCollectible(action: ForceLoadCollectibleRequestAction) {
  const { tokenId, contract } = action.payload
  const response: RemoteCollectibleAsset = yield call(() => api.refreshCollectible(contract, tokenId))
  const asset = {
    assetPackId: null,
    id: response.token_id,
    tags: [],
    category: CategoryName.COLLECTIBLE_CATEGORY,
    variations: [],
    contents: {},
    name: response.name,
    url: response.external_link,
    thumbnail: response.image_thumbnail_url
  }

  yield put(forceLoadCollectibleSuccess(asset))
}
