import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { AssetState } from 'modules/asset/reducer'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { ComponentDefinition, ComponentType } from 'modules/scene/types'
import { getComponentsByType } from 'modules/scene/selectors'
import { isNFT, isGround } from './utils'

export const getState: (state: RootState) => AssetState = state => state.asset

export const getData: (state: RootState) => AssetState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => AssetState['error'] = state => getState(state).error

export const getGroundAssets = createSelector<RootState, AssetState['data'], ModelById<Asset>>(
  getData,
  assets => {
    let out: ModelById<Asset> = {}

    for (let asset of Object.values(assets)) {
      if (asset.category === GROUND_CATEGORY) {
        out[asset.id] = asset
      }
    }

    return out
  }
)

export const getGroundAsset = (state: RootState, assetId: string) => getGroundAssets(state)[assetId]

export const getCollectibleAssets = createSelector<RootState, AssetState['data'], ModelById<Asset>>(
  getData,
  assets => {
    let out: ModelById<Asset> = {}

    for (let asset of Object.values(assets)) {
      if (asset.assetPackId === COLLECTIBLE_ASSET_PACK_ID) {
        out[asset.id] = asset
      }
    }

    return out
  }
)

export const getDisabledAssets = createSelector<
  RootState,
  ComponentDefinition<ComponentType.NFTShape>[],
  ComponentDefinition<ComponentType.GLTFShape>[],
  ModelById<Asset>,
  string[]
>(
  getComponentsByType(ComponentType.NFTShape),
  getComponentsByType(ComponentType.GLTFShape),
  getData,
  (nfts, gltfs, assets) => {
    let result: string[] = []

    for (let assetId in assets) {
      const asset = assets[assetId]

      if (isNFT(asset)) {
        const component = nfts.find(nft => nft.data.url.split('/').pop() === asset.id)
        if (component) {
          result.push(asset.id)
        }
      } else if (isGround(asset)) {
        const component = gltfs.find(gltf => {
          const { src } = gltf.data
          const assetPath = src.substring(src.indexOf('/') + 1, src.length)
          if (Object.keys(asset.contents).includes(assetPath)) {
            return true
          }
          return false
        })

        if (component) {
          result.push(asset.id)
        }
      }
    }
    return result
  }
)
