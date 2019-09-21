import { createSelector } from 'reselect'
import { env } from 'decentraland-commons'
import { RootState } from 'modules/common/types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { AssetPackState } from './reducer'
import { AssetState } from 'modules/asset/reducer'
import { getData as getAssets } from 'modules/asset/selectors'
import { FullAssetPack } from './types'

export const getState = (state: RootState) => state.assetPack
export const getData = createSelector<RootState, AssetPackState, AssetPackState['data']>(
  getState,
  state => {
    const assetPacks = state.data
    assetPacks[COLLECTIBLE_ASSET_PACK_ID] = {
      id: COLLECTIBLE_ASSET_PACK_ID,
      title: 'Collectibles',
      thumbnail: `${env.get('PUBLIC_URL')}/images/nft-icon.png`,
      assets: []
    }
    return assetPacks
  }
)

export const getError = (state: RootState) => getState(state).error
export const isLoading = (state: RootState) => getState(state).loading.length > 0
export const getProgress = (state: RootState) => getState(state).progress

export const getFullAssetPacks = createSelector<RootState, AssetPackState['data'], AssetState['data'], Record<string, FullAssetPack>>(
  getData,
  getAssets,
  (assetPacks, assets) => {
    return Object.keys(assetPacks).reduce(
      (acc, id) => ({
        ...acc,
        [id]: { ...assetPacks[id], assets: assetPacks[id].assets.map(id => assets[id]) }
      }),
      {}
    )
  }
)
