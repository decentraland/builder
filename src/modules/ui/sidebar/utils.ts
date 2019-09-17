import { BUILDER_SERVER_URL } from 'lib/api/builder'
import { Category } from './types'

export const COLLECTIBLE_ASSET_PACK_ID = 'collectibles'

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
    thumbnail: `${BUILDER_SERVER_URL}/storage/assets/QmUCDv34krVLGENkoRBuqATPwgrd6xF2k5NXLgeoNG6qW6`,
    assets: []
  },
  [CategoryName.TILES_CATEGORY]: {
    name: CategoryName.TILES_CATEGORY,
    thumbnail: `${BUILDER_SERVER_URL}/storage/assets/QmebeSZq8QxGZBgBgRQnm3JV94mRtt7zqUy28hzTc3ZuDH`,
    assets: []
  },
  [CategoryName.NATURE_CATEGORY]: {
    name: CategoryName.NATURE_CATEGORY,
    thumbnail: `${BUILDER_SERVER_URL}/storage/assets/QmYFWdh5yJnrg4VuXPniDd8HHbVrfV2FPn35RPdVYVMLjg`,
    assets: []
  },
  [CategoryName.STRUCTURES_CATEGORY]: {
    name: CategoryName.STRUCTURES_CATEGORY,
    thumbnail: `${BUILDER_SERVER_URL}/storage/assets/Qme15L6oTnjfAuCs9ayTDPNEBhPRJukcLVFDNw43UXUaLA`,
    assets: []
  },
  [CategoryName.DECORATIONS_CATEGORY]: {
    name: CategoryName.DECORATIONS_CATEGORY,
    thumbnail: `${BUILDER_SERVER_URL}/storage/assets/QmUQZQEGF2tSz2hBy4xyKZ4uoWoURvQUcTxJMEyHPEWjhX`,
    assets: []
  },
  [CategoryName.FURNITURE]: {
    name: CategoryName.FURNITURE,
    thumbnail: `${BUILDER_SERVER_URL}/storage/assets/Qmd7N96rupxCLr3mWwRfgsM6Pwnf7k2SUemvxTjYvSddgN`,
    assets: []
  }
}
