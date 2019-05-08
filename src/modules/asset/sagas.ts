import { call, put, takeLatest, select } from 'redux-saga/effects'
import { api } from 'lib/api'
import { LoadCollectiblesRequestAction, LOAD_COLLECTIBLES_REQUEST, loadCollectiblesSuccess, loadCollectiblesRequest } from './actions'
import { Asset, AssetRegistryResponse, DARAssetsResponse } from './types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export const COLLECTIBLE_WHITELIST = ['crypto-kitties']

export function* assetSaga() {
  yield takeLatest(LOAD_COLLECTIBLES_REQUEST, handleLoadCollectibles)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
}

function* handleConnectWallet() {
  yield put(loadCollectiblesRequest())
}

function* handleLoadCollectibles(_: LoadCollectiblesRequestAction) {
  const registryResponse: AssetRegistryResponse = yield call(() => api.fetchCollectibleRegistries())

  for (const registry of registryResponse.registries) {
    if (!COLLECTIBLE_WHITELIST.includes(registry.common_name)) continue
    const address = yield select(getAddress)

    const assetsResponse: DARAssetsResponse = yield call(() => api.fetchCollectibleAssets(registry.common_name, address))
    const assets: Asset[] = []

    for (let asset of assetsResponse.assets) {
      assets.push({
        assetPackId: COLLECTIBLE_ASSET_PACK_ID,
        id: asset.token_id,
        tags: [],
        category: registry.name,
        variations: [],
        contents: {},
        name: asset.name,
        url: asset.uri,
        thumbnail: asset.image
      })
    }

    yield put(loadCollectiblesSuccess(assets))
  }
}
