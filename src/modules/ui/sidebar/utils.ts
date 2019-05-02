import { CONTENT_SERVER } from 'modules/editor/utils'
import { Category } from './types'

export const COLLECTIBLE_ASSET_PACK_ID = 'collectibles'

export enum CategoryName {
  GROUND_CATEGORY = 'ground',
  TILES_CATEGORY = 'tiles',
  NATURE_CATEGORY = 'nature',
  STRUCTURES_CATEGORY = 'structures',
  DECORATIONS_CATEGORY = 'decorations',
  FURNITURE = 'furniture',
  CRYPTOKITTIES = 'CryptoKitties'
}

export const SIDEBAR_CATEGORIES: Record<CategoryName, Category> = {
  [CategoryName.GROUND_CATEGORY]: {
    name: CategoryName.GROUND_CATEGORY,
    thumbnail: `${CONTENT_SERVER}/QmUCDv34krVLGENkoRBuqATPwgrd6xF2k5NXLgeoNG6qW6`,
    assets: []
  },
  [CategoryName.TILES_CATEGORY]: {
    name: CategoryName.TILES_CATEGORY,
    thumbnail: `${CONTENT_SERVER}/QmebeSZq8QxGZBgBgRQnm3JV94mRtt7zqUy28hzTc3ZuDH`,
    assets: []
  },
  [CategoryName.NATURE_CATEGORY]: {
    name: CategoryName.NATURE_CATEGORY,
    thumbnail: `${CONTENT_SERVER}/QmYFWdh5yJnrg4VuXPniDd8HHbVrfV2FPn35RPdVYVMLjg`,
    assets: []
  },
  [CategoryName.STRUCTURES_CATEGORY]: {
    name: CategoryName.STRUCTURES_CATEGORY,
    thumbnail: `${CONTENT_SERVER}/Qme15L6oTnjfAuCs9ayTDPNEBhPRJukcLVFDNw43UXUaLA`,
    assets: []
  },
  [CategoryName.DECORATIONS_CATEGORY]: {
    name: CategoryName.DECORATIONS_CATEGORY,
    thumbnail: `${CONTENT_SERVER}/QmUQZQEGF2tSz2hBy4xyKZ4uoWoURvQUcTxJMEyHPEWjhX`,
    assets: []
  },
  [CategoryName.FURNITURE]: {
    name: CategoryName.FURNITURE,
    thumbnail: `${CONTENT_SERVER}/Qmd7N96rupxCLr3mWwRfgsM6Pwnf7k2SUemvxTjYvSddgN`,
    assets: []
  },
  [CategoryName.CRYPTOKITTIES]: {
    name: CategoryName.CRYPTOKITTIES,
    thumbnail: 'https://www.cryptokitties.co/icons/logo.svg',
    assets: []
  }
}
