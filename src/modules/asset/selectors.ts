import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { AssetState } from 'modules/asset/reducer'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { ModelById } from 'decentraland-dapps/dist/lib/types'

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
