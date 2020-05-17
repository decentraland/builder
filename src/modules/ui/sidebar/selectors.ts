import { createSelector } from 'reselect'
import { isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/common/types'
import { SidebarState } from 'modules/ui/sidebar/reducer'
import { Category, SidebarView } from 'modules/ui/sidebar/types'
import { getData as getAssets, isLoading as isLoadingAssets, getDisabledAssets } from 'modules/asset/selectors'
import { AssetState } from 'modules/asset/reducer'
import { Asset } from 'modules/asset/types'
import { AssetPackState } from 'modules/assetPack/reducer'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { AssetPack } from 'modules/assetPack/types'
import { SIDEBAR_CATEGORIES, COLLECTIBLE_ASSET_PACK_ID, NEW_ASSET_PACK_IDS, OLD_ASSET_PACK_IDS, sortByName } from './utils'

export const getState: (state: RootState) => SidebarState = state => state.ui.sidebar

export const getSearch = (state: RootState) => getState(state).search

export const getSelectedCategory = (state: RootState) => getState(state).selectedCategory

export const getSelectedAssetPackId = (state: RootState) => getState(state).selectedAssetPackId

export const getSidebarView = (state: RootState) => getState(state).view

export const showOnlyAssetsWithScripts = (state: RootState) => getState(state).scripts

const isSearchResult = (asset: Asset, search: string) => {
  // search by name
  if (asset.name !== null && asset.name.toLowerCase().includes(search)) {
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
  string[],
  AssetState['data'],
  boolean,
  Category[]
>(
  getSelectedAssetPack,
  getSearch,
  getSelectedCategory,
  getSidebarView,
  getDisabledAssets,
  getAssets,
  showOnlyAssetsWithScripts,
  (selectedAssetPack, search, selectedCategory, view, disabledAssets, assets, onlyAssetsWithScripts) => {
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

    // filter assets with scripts
    if (onlyAssetsWithScripts) {
      results = results.filter(asset => !!asset.script)
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

      if (disabledAssets.includes(asset.id)) {
        let newAsset = { ...asset }
        newAsset.isDisabled = true
        categories[asset.category].assets.push(newAsset)
      } else {
        categories[asset.category].assets.push(asset)
      }
    }

    let categoryArray = Object.values(categories).map<Category>(({ name }) => {
      const category = categories[name]
      const thumbnail = category.assets[0].thumbnail
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
        if (a.script && !b.script) {
          return -1
        } else if (!a.script && b.script) {
          return 1
        }
        return (a.name && b.name && a.name.localeCompare(b.name)) || 0
      })
    }

    return categoryArray
  }
)

export const getSidebarAssetPacks = createSelector<RootState, AssetPackState['data'], string | undefined, AssetPack[]>(
  getAssetPacks,
  getAddress,
  (assetPacks, address) => {
    const newAssetPacks: AssetPack[] = []
    const defaultAssetPacks: AssetPack[] = []
    const oldAssetPacks: AssetPack[] = []
    const userAssetPacks: AssetPack[] = []
    const collectibles: AssetPack[] = []

    for (const assetPack of Object.values(assetPacks)) {
      if (NEW_ASSET_PACK_IDS.includes(assetPack.id)) {
        newAssetPacks.push(assetPack)
      } else if (OLD_ASSET_PACK_IDS.includes(assetPack.id)) {
        oldAssetPacks.push(assetPack)
      } else if (assetPack.ethAddress === address) {
        userAssetPacks.push(assetPack)
      } else if (assetPack.id === COLLECTIBLE_ASSET_PACK_ID) {
        collectibles.push(assetPack)
      } else {
        defaultAssetPacks.push(assetPack)
      }
    }

    return [
      ...newAssetPacks.sort(sortByName),
      ...defaultAssetPacks.sort(sortByName),
      ...oldAssetPacks.sort(sortByName),
      ...userAssetPacks.sort(sortByName),
      ...collectibles
    ]
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
