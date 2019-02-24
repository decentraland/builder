import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SidebarState } from 'modules/ui/sidebar/reducer'
import { Category, SidebarView } from 'modules/ui/sidebar/types'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { AssetState } from 'modules/asset/reducer'
import { AssetPackState } from 'modules/assetPack/reducer'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { NO_GROUND_ASSET_PACK_ID, addNoGroundAsset, addNoGroundAssetPack } from './utils'

export const getState: (state: RootState) => SidebarState = state => state.ui.sidebar

export const getSelectedAssetPackId = (state: RootState) => getState(state).selectedAssetPackId

export const getSearch = (state: RootState) => getState(state).search

export const getSelectedCategory = (state: RootState) => getState(state).selectedCategory

export const getSidebarView = (state: RootState) => getState(state).view

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
  string | null,
  SidebarView,
  AssetPackState['data'],
  AssetState['data'],
  Category[]
>(
  getSelectedAssetPackId,
  getSearch,
  getSelectedCategory,
  getSidebarView,
  getAssetPacks,
  getAssets,
  (selectedAssetPackId, search, category, view, assetPacks, assets) => {
    assets = addNoGroundAsset(assets)
    assetPacks = addNoGroundAssetPack(assetPacks)

    const categories: { [categoryName: string]: Category } = {}

    // filter by selected asset pack, if none is selected use all asset packs
    const filteredAssetPacks = Object.keys(assetPacks)
      .filter(assetPackId => selectedAssetPackId == null || selectedAssetPackId === assetPackId || assetPackId === NO_GROUND_ASSET_PACK_ID)
      .map(assetPackId => assetPacks[assetPackId])

    const filteredAssetIds = Object.keys(assets)
      .filter(assetId => !search || isSearchResult(assets[assetId], search)) // filter assets by search (if any)
      .filter(assetId => view === SidebarView.LIST || category == null || assets[assetId].category === category) // if sidebar is in not in "list" view, filter by selected category
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
    return (
      Object.values(categories)
        // send grounds to the top
        .sort((a, b) => (a.name === GROUND_CATEGORY ? -1 : b.name === GROUND_CATEGORY ? 1 : a.name > b.name ? 1 : -1))
    )
  }
)
