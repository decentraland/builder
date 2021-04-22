import { getContentsStorageUrl } from 'lib/api/builder'
import { Category } from './types'
import { AssetPack } from 'modules/assetPack/types'

export const COLLECTIBLE_ASSET_PACK_ID = 'collectibles'

export const ASSET_PACK_ORDER = ['Genesis City', 'Pirates', 'Fantasy', 'Sci-Fi', 'Year Of The Pig', 'Toolbox', 'HTC Exodus']

export const NEW_ASSET_PACKS = []

export const isSameAssetPack = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export enum CategoryName {
  GROUND_CATEGORY = 'ground',
  TILES_CATEGORY = 'tiles',
  NATURE_CATEGORY = 'nature',
  STRUCTURES_CATEGORY = 'structures',
  DECORATIONS_CATEGORY = 'decorations',
  FURNITURE = 'furniture'
}

export const SIDEBAR_CATEGORIES: Record<CategoryName, Category> = {
  [CategoryName.GROUND_CATEGORY]: {
    name: CategoryName.GROUND_CATEGORY,
    thumbnail: getContentsStorageUrl('QmUCDv34krVLGENkoRBuqATPwgrd6xF2k5NXLgeoNG6qW6'),
    assets: []
  },
  [CategoryName.TILES_CATEGORY]: {
    name: CategoryName.TILES_CATEGORY,
    thumbnail: getContentsStorageUrl('QmebeSZq8QxGZBgBgRQnm3JV94mRtt7zqUy28hzTc3ZuDH'),
    assets: []
  },
  [CategoryName.NATURE_CATEGORY]: {
    name: CategoryName.NATURE_CATEGORY,
    thumbnail: getContentsStorageUrl('QmYFWdh5yJnrg4VuXPniDd8HHbVrfV2FPn35RPdVYVMLjg'),
    assets: []
  },
  [CategoryName.STRUCTURES_CATEGORY]: {
    name: CategoryName.STRUCTURES_CATEGORY,
    thumbnail: getContentsStorageUrl('Qme15L6oTnjfAuCs9ayTDPNEBhPRJukcLVFDNw43UXUaLA'),
    assets: []
  },
  [CategoryName.DECORATIONS_CATEGORY]: {
    name: CategoryName.DECORATIONS_CATEGORY,
    thumbnail: getContentsStorageUrl('QmUQZQEGF2tSz2hBy4xyKZ4uoWoURvQUcTxJMEyHPEWjhX'),
    assets: []
  },
  [CategoryName.FURNITURE]: {
    name: CategoryName.FURNITURE,
    thumbnail: getContentsStorageUrl('Qmd7N96rupxCLr3mWwRfgsM6Pwnf7k2SUemvxTjYvSddgN'),
    assets: []
  }
}

export const sortByOrder = (a: AssetPack, b: AssetPack) => {
  const indexA = ASSET_PACK_ORDER.findIndex(name => isSameAssetPack(a.title, name))
  const indexB = ASSET_PACK_ORDER.findIndex(name => isSameAssetPack(b.title, name))
  if (indexA === -1) return 1
  if (indexB === -1) return -1
  return indexA > indexB ? 1 : -1
}
