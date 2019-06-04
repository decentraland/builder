import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { SidebarState } from 'modules/ui/sidebar/reducer'
import { Category, SidebarView } from 'modules/ui/sidebar/types'
import { getData as getAssets, isLoading as isLoadingAssets } from 'modules/asset/selectors'
import { AssetState } from 'modules/asset/reducer'
import { Asset } from 'modules/asset/types'
import { AssetPackState } from 'modules/assetPack/reducer'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { AssetPack } from 'modules/assetPack/types'
import { SIDEBAR_CATEGORIES, COLLECTIBLE_ASSET_PACK_ID, CategoryName } from './utils'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'

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
  (selectedAssetPack, search, selectedCategory, view, assets) => {
    const categories: { [categoryName: string]: Category } = {}

    let results = Object.values(assets)

    // filter by search
    if (search) {
      results = results.filter(asset => isSearchResult(asset, search))
    } else if (view !== SidebarView.LIST && selectedAssetPack) {
      // filter by asset pack if one is selected (and not in list view)
      results = results.filter(asset => selectedAssetPack.id === asset.assetPackId)
      // filter by category if one is selected
      if (selectedCategory) {
        results = results.filter(asset => asset.category === selectedCategory)
      }
    }

    // build categories
    for (const asset of results) {
      if (!(asset.category in categories)) {
        categories[asset.category] = {
          name: asset.category,
          assets: [],
          thumbnail: ''
        }
      }
      categories[asset.category].assets.push(asset)
    }

    let categoryArray = Object.values(categories).map<Category>(({ name }) => {
      const knownCategory = SIDEBAR_CATEGORIES[name as CategoryName]
      const category = categories[name]
      let thumbnail = category.thumbnail

      if (knownCategory) {
        thumbnail = knownCategory.thumbnail
      } else if (!thumbnail) {
        thumbnail = category.assets[0].thumbnail
      }

      return {
        ...categories[name],
        thumbnail
      }
    })

    // sort category array using the order of keys of SIDEBAR_CATEGORIES
    const order = Object.keys(SIDEBAR_CATEGORIES)
    categoryArray.sort((a, b) => (order.indexOf(a.name) > order.indexOf(b.name) ? 1 : -1))

    // move selected category up
    if (selectedCategory) {
      categoryArray = [...categoryArray.filter(c => c.name === selectedCategory), ...categoryArray.filter(c => c.name !== selectedCategory)]
    }

    // move selected asset pack up
    for (const category of categoryArray) {
      category.assets.sort((a, b) => {
        if (selectedAssetPack) {
          if (a.assetPackId === selectedAssetPack.id && b.assetPackId !== selectedAssetPack.id) {
            return -1
          }
          if (a.assetPackId !== selectedAssetPack.id && b.assetPackId === selectedAssetPack.id) {
            return 1
          }
        }
        return 0
      })
    }

    return categoryArray
  }
)

export const getSidebarAssetPacks = createSelector<RootState, AssetPackState['data'], AssetPack[]>(
  getAssetPacks,
  assetPacks => {
    let array = Object.values(assetPacks)
    const collectibles = array.findIndex(pack => pack.id === COLLECTIBLE_ASSET_PACK_ID)
    if (collectibles > -1) {
      const pack = array.splice(collectibles, 1)
      array = array.concat(pack)
    }
    return array
  }
)

export const isSearchDisabled = createSelector<RootState, string | null, boolean, string, Category[], boolean, boolean>(
  getSelectedAssetPackId,
  isLoadingAssets,
  getSearch,
  getSideBarCategories,
  isConnected,
  (selectedAssetPackId, isLoading, search, categories, connected) => {
    // disable search when crypto-collectibles are loading or when the wallet is connected and it's empty
    const isLoadingCollectibles = selectedAssetPackId === COLLECTIBLE_ASSET_PACK_ID && isLoading
    const isEmptyWallet = selectedAssetPackId === COLLECTIBLE_ASSET_PACK_ID && connected && !search && categories.length === 0

    return isLoadingCollectibles || isEmptyWallet
  }
)
