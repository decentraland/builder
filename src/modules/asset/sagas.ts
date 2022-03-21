import { call, put, takeLatest, select } from 'redux-saga/effects'
import {
  LoadCollectiblesRequestAction,
  LOAD_COLLECTIBLES_REQUEST,
  loadCollectiblesSuccess,
  loadCollectiblesRequest,
  loadCollectiblesFailure
} from './actions'
import { Asset } from './types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { TRANSPARENT_PIXEL } from 'lib/getModelData'
import { BuilderClient, NFT } from '@dcl/builder-client'
import { sleep } from 'decentraland-commons/dist/utils'

export function* assetSaga(client: BuilderClient) {
  yield takeLatest(LOAD_COLLECTIBLES_REQUEST, handleLoadCollectibles)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)

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
      const serverNFTs: NFT[] = yield call(getNFTs, address)
      for (const openseaAsset of serverNFTs) {
        const uri = `ethereum://${openseaAsset.contract.address}/${openseaAsset.tokenId}`
        assets.push({
          assetPackId: COLLECTIBLE_ASSET_PACK_ID,
          id: uri,
          tags: [],
          category: openseaAsset.contract.name,
          contents: {},
          name: openseaAsset.name || '',
          model: uri,
          script: null,
          thumbnail: openseaAsset.imageThumbnailUrl || TRANSPARENT_PIXEL,
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

  async function getNFTs(owner: string, cursor?: string): Promise<NFT[]> {
    const response = await client.getNFTs({ owner, cursor })

    const { next, nfts } = response

    if (next) {
      const nextNFTs = await getNFTs(owner, next)

      return [...nfts, ...nextNFTs]
    }

    return nfts
  }
}
