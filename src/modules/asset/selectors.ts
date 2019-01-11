import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { AssetState } from 'modules/asset/reducer'

export const getState: (state: RootState) => AssetState = state => state.asset

export const getData: (state: RootState) => AssetState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => AssetState['error'] = state => getState(state).error

export const getAssetMappings = createSelector<RootState, AssetState['data'], Record<string, string>>(
  getData,
  assets => {
    let mappings: Record<string, string> = {}
    for (let assetId in assets) {
      const asset = assets[assetId]
      for (let contentPath in asset.contents) {
        mappings[`${asset.assetPackId}/${contentPath}`] = asset.contents[contentPath]
      }
    }
    return mappings
  }
)
