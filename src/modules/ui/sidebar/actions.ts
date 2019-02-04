import { action } from 'typesafe-actions'

// Select Asset Pack

export const SELECT_ASSET_PACK = 'Select asset pack'

export const selectAssetPack = (assetPackId: string | null) => action(SELECT_ASSET_PACK, { assetPackId })

export type SelectAssetPackAction = ReturnType<typeof selectAssetPack>

// Search Assets

export const SEARCH_ASSETS = 'Search assets'

export const searchAssets = (search: string) => action(SEARCH_ASSETS, { search })

export type SearchAssetsAction = ReturnType<typeof searchAssets>
