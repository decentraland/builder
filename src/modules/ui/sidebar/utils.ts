import { env } from 'decentraland-commons'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { AssetPack } from 'modules/assetPack/types'
import { CONTENT_SERVER } from 'modules/editor/utils'
import { Category } from './types'

export const EMPTY_GROUND_ASSET_ID = 'EMPTY_GROUND_ASSET_ID'
export const EMPTY_GROUND_ASSET_PACK_ID = 'EMPTY_GROUND_ASSET_PACK_ID'

export function addEmptyGroundAsset(assets: DataByKey<Asset>) {
  return {
    ...assets,
    [EMPTY_GROUND_ASSET_ID]: {
      id: EMPTY_GROUND_ASSET_ID,
      assetPackId: EMPTY_GROUND_ASSET_PACK_ID,
      name: t('itemdrawer.empty_ground'),
      category: GROUND_CATEGORY,
      thumbnail: `${env.get('PUBLIC_URL')}/images/empty-ground.png`,
      url: '',
      tags: [GROUND_CATEGORY],
      variations: [],
      contents: {}
    }
  }
}

export function addEmptyGroundAssetPack(assetPacks: DataByKey<AssetPack>) {
  return {
    ...assetPacks,
    [EMPTY_GROUND_ASSET_PACK_ID]: {
      id: EMPTY_GROUND_ASSET_PACK_ID,
      title: t('itemdrawer.empty_ground'),
      version: 0,
      assets: [EMPTY_GROUND_ASSET_ID]
    }
  }
}

export enum CategoryName {
  GROUND_CATEGORY = 'ground',
  TILES_CATEGORY = 'tiles',
  NATURE_CATEGORY = 'nature',
  STRUCTURES_CATEGORY = 'structures',
  DECORATIONS_CATEGORY = 'decorations',
  COLLECTIBLE_CATEGORY = 'collectible'
}

export const SIDEBAR_CATEGORIES: Record<CategoryName, Category> = {
  [CategoryName.GROUND_CATEGORY]: {
    name: CategoryName.GROUND_CATEGORY,
    thumbnail: `${CONTENT_SERVER}QmUCDv34krVLGENkoRBuqATPwgrd6xF2k5NXLgeoNG6qW6`,
    assets: []
  },
  [CategoryName.TILES_CATEGORY]: {
    name: CategoryName.TILES_CATEGORY,
    thumbnail: `${CONTENT_SERVER}QmebeSZq8QxGZBgBgRQnm3JV94mRtt7zqUy28hzTc3ZuDH`,
    assets: []
  },
  [CategoryName.NATURE_CATEGORY]: {
    name: CategoryName.NATURE_CATEGORY,
    thumbnail: `${CONTENT_SERVER}QmYFWdh5yJnrg4VuXPniDd8HHbVrfV2FPn35RPdVYVMLjg`,
    assets: []
  },
  [CategoryName.STRUCTURES_CATEGORY]: {
    name: CategoryName.STRUCTURES_CATEGORY,
    thumbnail: `${CONTENT_SERVER}Qme15L6oTnjfAuCs9ayTDPNEBhPRJukcLVFDNw43UXUaLA`,
    assets: []
  },
  [CategoryName.DECORATIONS_CATEGORY]: {
    name: CategoryName.DECORATIONS_CATEGORY,
    thumbnail: `${CONTENT_SERVER}Qmd7N96rupxCLr3mWwRfgsM6Pwnf7k2SUemvxTjYvSddgN`,
    assets: []
  },
  [CategoryName.COLLECTIBLE_CATEGORY]: {
    name: CategoryName.COLLECTIBLE_CATEGORY,
    thumbnail: 'https://www.cryptokitties.co/icons/logo.svg',
    assets: []
  }
}
