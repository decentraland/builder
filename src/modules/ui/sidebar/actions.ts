import { action } from 'typesafe-actions'
import { SidebarView } from './types'

// Select Asset Pack

export const TOGGLE_ASSET_PACK = 'Toggle asset pack'

export const toggleAssetPack = (assetPackId: string, enabled: boolean) => action(TOGGLE_ASSET_PACK, { assetPackId, enabled })

export type ToggleAssetPackAction = ReturnType<typeof toggleAssetPack>

// Search Assets

export const SEARCH_ASSETS = 'Search assets'

export const searchAssets = (search: string) => action(SEARCH_ASSETS, { search })

export type SearchAssetsAction = ReturnType<typeof searchAssets>

// Select Category

export const SELECT_CATEGORY = 'Select category'

export const selectCategory = (category: string | null) => action(SELECT_CATEGORY, { category })

export type SelectCategoryAction = ReturnType<typeof selectCategory>

// Set sidebar view

export const SET_SIDEBAR_VIEW = 'Set sidebar view'

export const setSidebarView = (view: SidebarView) => action(SET_SIDEBAR_VIEW, { view })

export type SetSidebarViewAction = ReturnType<typeof setSidebarView>

// Set available asset packs

export const SET_AVAILABLE_ASSET_PACKS = 'Set available asset packs'

export const setAvailableAssetPacks = (assetPackIds: string[]) => action(SET_AVAILABLE_ASSET_PACKS, { assetPackIds })

export type setAvailableAssetPacksAction = ReturnType<typeof setAvailableAssetPacks>
