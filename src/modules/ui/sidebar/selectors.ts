import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { SidebarState } from 'modules/ui/sidebar/reducer'
import { Category, SidebarView } from 'modules/ui/sidebar/types'
import { getData as getAssets } from 'modules/asset/selectors'
import { AssetState } from 'modules/asset/reducer'
import { Asset } from 'modules/asset/types'
import { AssetPackState } from 'modules/assetPack/reducer'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { AssetPack } from 'modules/assetPack/types'
import { SIDEBAR_CATEGORIES } from './utils'

export const getState: (state: RootState) => SidebarState = state => state.ui.sidebar

export const getSearch = (state: RootState) => getState(state).search

export const getSelectedCategory = (state: RootState) => getState(state).selectedCategory

export const getSelectedAssetPackId = (state: RootState) => getState(state).selectedAssetPackId

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

export const isList = (state: RootState) => getSidebarView(state) === SidebarView.LIST

export const getAvailableAssetPackIds = (state: RootState) => getState(state).availableAssetPackIds

export const getNewAssetPackIds = (state: RootState) => getState(state).newAssetPackIds

export const getSelectedAssetPack = createSelector<RootState, string | null, AssetPackState['data'], AssetPack | null>(
  getSelectedAssetPackId,
  getAssetPacks,
  (selectedAssetPackId, assetPacks) => {
    return selectedAssetPackId ? assetPacks[selectedAssetPackId] : null
  }
)

export const getSideBarCategories = createSelector<
  RootState,
  AssetPack | null,
  string,
  string | null,
  SidebarView,
  AssetState['data'],
  Category[]
>(
  getSelectedAssetPack,
  getSearch,
  getSelectedCategory,
  getSidebarView,
  getAssets,
  (selectedAssetPack, search, category, view, assets) => {
    const categories: { [categoryName: string]: Category } = {}
    Object.values(assets)
      // filter by selected asset pack
      .filter(asset => selectedAssetPack == null || selectedAssetPack.id === asset.assetPackId)
      // filter assets by search (if any)
      .filter(asset => !search || isSearchResult(asset, search))
      // if sidebar is in not in "list" view, filter by selected category
      .filter(asset => view === SidebarView.LIST || category == null || asset.category === category)
      // populate categories with filtered assets
      .forEach(asset => {
        if (!(asset.category in categories)) {
          categories[asset.category] = {
            name: asset.category,
            assets: [],
            thumbnail: ''
          }
        }
        categories[asset.category].assets.push(asset)
      })

    // convert map to array
    const categoryArray = SIDEBAR_CATEGORIES.filter(({ name }) => name in categories).map<Category>(({ name, thumbnail }) => ({
      ...categories[name],
      thumbnail
    }))

    // add categories that are not present in SIDEBAR_CATEGORIES (fallback)
    Object.values(categories).forEach(category => {
      if (!categoryArray.some(cat => cat.name === category.name)) {
        categoryArray.push({
          ...category,
          thumbnail: category.assets[0].thumbnail
        })
      }
    })

    return categoryArray
  }
)

export const getSidebarAssetPacks = createSelector<RootState, string[], AssetPackState['data'], AssetPack[]>(
  getAvailableAssetPackIds,
  getAssetPacks,
  (availableAssetPackIds, assetPacks) => {
    return availableAssetPackIds.map(id => assetPacks[id]).filter(assetPack => !!assetPack)
  }
)
