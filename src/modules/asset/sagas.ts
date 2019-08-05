import { call, put, takeLatest, select } from 'redux-saga/effects'
import { api } from 'lib/api'
import { LoadCollectiblesRequestAction, LOAD_COLLECTIBLES_REQUEST, loadCollectiblesSuccess, loadCollectiblesRequest } from './actions'
import { Asset, AssetRegistry, DARAsset } from './types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export const COLLECTIBLE_WHITELIST = [
  'crypto-kitties',
  'hyper-dragons',
  'axie-infinity',
  'blockchain-cuties',
  'chibi-fighters',
  'etheremon',
  'mlb-champions',
  'mycryptoheroes',
  'mycryptoheroes-extension',
  'chainbreakers-items',
  'chainbreakers-pets',
  'chainbreakers-units',
  'chainbreakers-rings',
  'chainguardians'
]

export function* assetSaga() {
  yield takeLatest(LOAD_COLLECTIBLES_REQUEST, handleLoadCollectibles)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
}

function* handleConnectWallet() {
  yield put(loadCollectiblesRequest())
}

function* handleLoadCollectibles(_: LoadCollectiblesRequestAction) {
  const darRegistries: AssetRegistry[] = yield call(() => api.fetchCollectibleRegistries())

  const assets: Asset[] = []
  const address = yield select(getAddress)
  const promises: Promise<{ assets: DARAsset[]; registry: AssetRegistry }>[] = []

  for (const registry of darRegistries) {
    if (!COLLECTIBLE_WHITELIST.includes(registry.common_name)) continue
    promises.push(api.fetchCollectibleAssets(registry.common_name, address).then(assets => ({ assets, registry })))
  }

  const results: { assets: DARAsset[]; registry: AssetRegistry }[] = yield call(() => Promise.all(promises))

  for (const result of results) {
    for (let asset of result.assets) {
      assets.push({
        assetPackId: COLLECTIBLE_ASSET_PACK_ID,
        id: asset.token_id,
        tags: [],
        category: result.registry.name,
        variations: [],
        contents: {},
        name: asset.name,
        url: asset.uri,
        thumbnail: asset.image
      })
    }
  }

  yield put(loadCollectiblesSuccess(assets))
}
