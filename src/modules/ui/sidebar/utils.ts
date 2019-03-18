import { env } from 'decentraland-commons'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { AssetPack } from 'modules/assetPack/types'
import { CONTENT_SERVER } from 'modules/editor/utils'

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

export const SIDEBAR_CATEGORIES: { name: string; thumbnail: string }[] = [
  {
    name: GROUND_CATEGORY,
    thumbnail: `${CONTENT_SERVER}QmUCDv34krVLGENkoRBuqATPwgrd6xF2k5NXLgeoNG6qW6`
  },
  {
    name: 'tiles',
    thumbnail: `${CONTENT_SERVER}QmebeSZq8QxGZBgBgRQnm3JV94mRtt7zqUy28hzTc3ZuDH`
  },
  {
    name: 'nature',
    thumbnail: `${CONTENT_SERVER}QmYFWdh5yJnrg4VuXPniDd8HHbVrfV2FPn35RPdVYVMLjg`
  },
  {
    name: 'structures',
    thumbnail: `${CONTENT_SERVER}Qme15L6oTnjfAuCs9ayTDPNEBhPRJukcLVFDNw43UXUaLA`
  },
  {
    name: 'decorations',
    thumbnail: `${CONTENT_SERVER}Qmd7N96rupxCLr3mWwRfgsM6Pwnf7k2SUemvxTjYvSddgN`
  },
  {
    name: 'year of the pig',
    thumbnail: `${CONTENT_SERVER}QmeHgdLkKaRLpFKPECUxQTEb3NEHbcKkgCcjhBq693d62n`
  }
]
