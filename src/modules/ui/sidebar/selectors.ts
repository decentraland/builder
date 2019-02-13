import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SidebarState } from 'modules/ui/sidebar/reducer'
import { Category } from 'modules/ui/sidebar/types'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { AssetState } from 'modules/asset/reducer'
import { AssetPackState } from 'modules/assetPack/reducer'
import { Asset, GROUND_TAG } from 'modules/asset/types'

export const getState: (state: RootState) => SidebarState = state => state.ui.sidebar

export const getSelectedAssetPackId = (state: RootState) => getState(state).selectedAssetPackId

export const getSearch = (state: RootState) => getState(state).search

const isSearchResult = (asset: Asset, search: string) => {
  // search by name
  if (asset.name.toLowerCase().includes(search)) {
    return true
  }
  // search by category
  if (asset.category.toLowerCase().includes(search)) {
    return true
  }
  // search by tags
  if (asset.tags.some(tag => tag.toLowerCase().includes(search))) {
    return true
  }
  // not in search results
  return false
}

export const getSideBarCategories = createSelector<
  RootState,
  string | null,
  string,
  AssetPackState['data'],
  AssetState['data'],
  Category[]
>(
  getSelectedAssetPackId,
  getSearch,
  getAssetPacks,
  getAssets,
  (selectedAssetPackId, search, assetPacks, assets) => {
    const categories: { [categoryName: string]: Category } = {}

    // filter by selected asset pack, if none is selected use all asset packs
    const filteredAssetPacks = Object.keys(assetPacks)
      .filter(assetPackId => selectedAssetPackId == null || selectedAssetPackId === assetPackId)
      .map(assetPackId => assetPacks[assetPackId])

    const filteredAssetIds = Object.keys(assets)
      .filter(assetId => !search || isSearchResult(assets[assetId], search)) // filter assets by search (if any)
      .filter(assetId => assets[assetId].category !== GROUND_TAG) // filter out if "ground" tag (category) is present
      .reduce((ids, assetId) => ({ ...ids, [assetId]: true }), {})

    for (const assetPack of filteredAssetPacks) {
      for (const assetId of assetPack.assets) {
        // check if it hasn't been filtered out
        if (assetId in filteredAssetIds) {
          const asset = assets[assetId]
          // check if category already exits, otherwise create it
          const categoryExists = asset.category in categories
          if (!categoryExists) {
            categories[asset.category] = {
              name: asset.category,
              assets: []
            }
          }
          // add asset to category
          categories[asset.category].assets.push(asset)
        }
      }
    }

    // convert map to array
    return Object.values(categories)
  }
)
