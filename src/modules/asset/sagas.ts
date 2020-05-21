import { call, put, takeLatest, select } from 'redux-saga/effects'
import { LoadCollectiblesRequestAction, LOAD_COLLECTIBLES_REQUEST, loadCollectiblesSuccess, loadCollectiblesRequest } from './actions'
import { dar } from 'lib/api/dar'
import { Asset, AssetRegistry, DARAsset } from './types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export function* assetSaga() {
  yield takeLatest(LOAD_COLLECTIBLES_REQUEST, handleLoadCollectibles)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
}

function* handleConnectWallet() {
  yield put(loadCollectiblesRequest())
}

function* handleLoadCollectibles(_: LoadCollectiblesRequestAction) {
  const darRegistries: AssetRegistry[] = yield call(() => dar.fetchCollectibleRegistries())

  const assets: Asset[] = []
  const address = yield select(getAddress)
  const promises: Promise<{ assets: DARAsset[]; registry: AssetRegistry }>[] = []

  for (const registry of darRegistries) {
    promises.push(dar.fetchCollectibleAssets(registry.common_name, address).then(assets => ({ assets, registry })))
  }

  const results: { assets: DARAsset[]; registry: AssetRegistry }[] = yield call(() => Promise.all(promises))

  for (const result of results) {
    for (let asset of result.assets) {
      assets.push({
        assetPackId: COLLECTIBLE_ASSET_PACK_ID,
        id: asset.token_id,
        tags: [],
        category: result.registry.name,
        contents: {},
        name: asset.name || '',
        model: asset.uri,
        script: null,
        thumbnail: asset.image,
        metrics: {
          triangles: 0,
          materials: 0,
          meshes: 0,
          bodies: 0,
          entities: 0,
          textures: 0
        },
        parameters: [],
        actions: []
      })
    }
  }

  yield put(loadCollectiblesSuccess(assets))
}
