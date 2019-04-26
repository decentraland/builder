import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SidebarState } from 'modules/ui/sidebar/reducer'
import { Category, SidebarView } from 'modules/ui/sidebar/types'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { AssetState } from 'modules/asset/reducer'
import { AssetPackState } from 'modules/assetPack/reducer'
import { Asset } from 'modules/asset/types'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { SIDEBAR_CATEGORIES, CategoryName } from './utils'

export const getState: (state: RootState) => SidebarState = state => state.ui.sidebar

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

export const getAvailableAssetPackIds = (state: RootState) => getState(state).availableAssetPackIds

export const getNewAssetPackIds = (state: RootState) => getState(state).newAssetPackIds

export const getSelectedAssetPackIds = createSelector<RootState, SidebarState, AssetPackState['data'], string[]>(
  getState,
  getAssetPacks,
  (sidebar, _assetPacks) => {
    const { selectedAssetPackIds, availableAssetPackIds } = sidebar
    if (selectedAssetPackIds.length === 0) {
      // Default selection for first time users
      return availableAssetPackIds
    } else {
      // Selection for existing users
      return selectedAssetPackIds
    }
  }
)

export const getSideBarCategories = createSelector<
  RootState,
  Project | null,
  string,
  string | null,
  SidebarView,
  AssetState['data'],
  Category[]
>(
  getCurrentProject,
  getSearch,
  getSelectedCategory,
  getSidebarView,
  getAssets,
  (project, search, category, view, assets) => {
    const categories: Record<string, Category> = {}
    const selectedAssetPackId = project ? project.assetPackIds || [] : []

    Object.values(assets)
      // filter by selected asset packs
      .filter(
        asset =>
          selectedAssetPackId.length === 0 ||
          asset.assetPackId === null ||
          (asset.assetPackId && selectedAssetPackId.includes(asset.assetPackId))
      )
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

    console.log('selected categories', categoryArray, category)

    if ((category === null || category === CategoryName.COLLECTIBLE_CATEGORY) && !(CategoryName.COLLECTIBLE_CATEGORY in categories)) {
      categoryArray.push(SIDEBAR_CATEGORIES.collectibles)
    }

    return categoryArray
  }
)
