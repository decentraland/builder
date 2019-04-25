import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SidebarState } from 'modules/ui/sidebar/reducer'
import { Category, SidebarView } from 'modules/ui/sidebar/types'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { AssetState } from 'modules/asset/reducer'
import { AssetPackState } from 'modules/assetPack/reducer'
import { Asset } from 'modules/asset/types'
import { addEmptyGroundAsset, addEmptyGroundAssetPack, SIDEBAR_CATEGORIES, CategoryName } from './utils'

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
    assets = addEmptyGroundAsset(assets)
    assetPacks = addEmptyGroundAssetPack(assetPacks)

    const categories: { [categoryName: string]: Category } = {}

    Object.values(assets)
      // filter by selected asset pack
      .filter(asset => selectedAssetPackId == null || selectedAssetPackId === asset.assetPackId)
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
    const categoryArray = Object.values(SIDEBAR_CATEGORIES)
      .filter(({ name }) => name in categories)
      .map<Category>(({ name, thumbnail }) => ({
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

    if (!(CategoryName.COLLECTIBLE_CATEGORY in categories)) {
      categoryArray.push(SIDEBAR_CATEGORIES.collectible)
    }

    return categoryArray
  }
)
