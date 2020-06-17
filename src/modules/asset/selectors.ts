import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { AssetState } from 'modules/asset/reducer'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { ComponentDefinition, ComponentType, AnyComponent, EntityDefinition } from 'modules/scene/types'
import { getComponentsByType, getEntities, getComponentsByEntityId } from 'modules/scene/selectors'
import { isNFT, isGround } from './utils'

export const getState: (state: RootState) => AssetState = state => state.asset

export const getData: (state: RootState) => AssetState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => AssetState['error'] = state => getState(state).error

export const getGroundAssets = createSelector<RootState, AssetState['data'], ModelById<Asset>>(getData, assets => {
  let out: ModelById<Asset> = {}

  for (let asset of Object.values(assets)) {
    if (asset.category === GROUND_CATEGORY) {
      out[asset.id] = asset
    }
  }

  return out
})

export const getGroundAsset = (state: RootState, assetId: string) => getGroundAssets(state)[assetId]

export const getCollectibleAssets = createSelector<RootState, AssetState['data'], ModelById<Asset>>(getData, assets => {
  let out: ModelById<Asset> = {}

  for (let asset of Object.values(assets)) {
    if (asset.assetPackId === COLLECTIBLE_ASSET_PACK_ID) {
      out[asset.id] = asset
    }
  }

  return out
})

export const getDisabledAssets = createSelector<RootState, Record<ComponentType, AnyComponent[]>, ModelById<Asset>, string[]>(
  (state: RootState) => getComponentsByType(state),
  getData,
  (components, assets) => {
    let result: string[] = []
    const nfts = components[ComponentType.NFTShape] as ComponentDefinition<ComponentType.NFTShape>[]
    const gltfs = components[ComponentType.GLTFShape] as ComponentDefinition<ComponentType.GLTFShape>[]

    for (let assetId in assets) {
      const asset = assets[assetId]

      if (isNFT(asset)) {
        const component = nfts.find(nft => nft.data.url === asset.id)
        if (component) {
          result.push(asset.id)
        }
      } else if (isGround(asset)) {
        const component = gltfs.find(gltf => {
          const { assetId } = gltf.data
          return asset.id === assetId
        })

        if (component) {
          result.push(asset.id)
        }
      }
    }
    return result
  }
)

export const getAssetsByModel = createSelector<RootState, AssetState['data'], Record<string, Asset>>(getData, assets => {
  const out: Record<string, Asset> = {}
  for (let id in assets) {
    const asset = assets[id]
    out[asset.model] = asset
  }
  return out
})

export const getAssetsByEntityName = createSelector<
  RootState,
  Record<string, EntityDefinition>,
  Record<string, AnyComponent[]>,
  AssetState['data'],
  Record<string, Asset>
>(getEntities, getComponentsByEntityId, getData, (entities, componentsByEntity, assets) => {
  const out: Record<string, Asset> = {}
  for (let entityId in componentsByEntity) {
    const entity = entities[entityId]
    const components = componentsByEntity[entityId]
    for (let component of components) {
      if (component.type === ComponentType.Script || component.type === ComponentType.GLTFShape) {
        const asset = assets[(component as ComponentDefinition<ComponentType.Script>).data.assetId]
        out[entity.name] = asset
      }
    }
  }
  return out
})

export const getAssetsWithScriptByEntityName = createSelector<
  RootState,
  Record<string, EntityDefinition>,
  Record<string, AnyComponent[]>,
  AssetState['data'],
  Record<string, Asset>
>(getEntities, getComponentsByEntityId, getData, (entities, componentsByEntity, assets) => {
  const out: Record<string, Asset> = {}
  for (let entityId in componentsByEntity) {
    const components = componentsByEntity[entityId]
    for (let component of components) {
      if (component.type === ComponentType.Script) {
        const asset = assets[(component as ComponentDefinition<ComponentType.Script>).data.assetId]
        if (asset && asset.actions.length > 0) {
          out[entities[entityId].name] = asset
        }
      }
    }
  }
  return out
})
