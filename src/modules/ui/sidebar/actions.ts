import { action } from 'typesafe-actions'
import { SidebarView } from './types'

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

// Set new asset packs

export const SET_NEW_ASSET_PACKS = 'Set new asset packs'

export const setNewAssetPacks = (assetPackIds: string[]) => action(SET_NEW_ASSET_PACKS, { assetPackIds })

export type setNewAssetPacksAction = ReturnType<typeof setNewAssetPacks>
