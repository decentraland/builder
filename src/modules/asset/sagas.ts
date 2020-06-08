import { call, put, takeLatest, select } from 'redux-saga/effects'
import {
  LoadCollectiblesRequestAction,
  LOAD_COLLECTIBLES_REQUEST,
  loadCollectiblesSuccess,
  loadCollectiblesRequest,
  loadCollectiblesFailure
} from './actions'
import { Asset, OpenSeaAsset } from './types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { opensea } from 'lib/api/opensea'
import { TRANSPARENT_PIXEL } from 'lib/getModelData'

export function* assetSaga() {
  yield takeLatest(LOAD_COLLECTIBLES_REQUEST, handleLoadCollectibles)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
}

function* handleConnectWallet() {
  yield put(loadCollectiblesRequest())
}

function* handleLoadCollectibles(_: LoadCollectiblesRequestAction) {
  const address: string | null = yield select(getAddress)

  try {
    if (!address) {
      throw new Error(`Invalid address: ${address}`)
    }
    const assets: Asset[] = []
    const openseaAssets: OpenSeaAsset[] = yield call(() => opensea.fetchAssets(address))
    for (const openseaAsset of openseaAssets) {
      const uri = `ethereum://${openseaAsset.asset_contract.address}/${openseaAsset.token_id}`
      assets.push({
        assetPackId: COLLECTIBLE_ASSET_PACK_ID,
        id: uri,
        tags: [],
        category: openseaAsset.asset_contract.name,
        contents: {},
        name: openseaAsset.name || '',
        model: uri,
        script: null,
        thumbnail: openseaAsset.image_thumbnail_url || TRANSPARENT_PIXEL,
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
    yield put(loadCollectiblesSuccess(assets))
  } catch (error) {
    yield put(loadCollectiblesFailure(error.message))
  }
}
