import { DataByKey } from 'decentraland-dapps/dist/lib/types'

import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { AssetPack } from 'modules/assetPack/types'

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
      thumbnail: '',
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
    thumbnail: 'https://content.decentraland.today/contents/QmUCDv34krVLGENkoRBuqATPwgrd6xF2k5NXLgeoNG6qW6'
  },
  {
    name: 'tiles',
    thumbnail: 'https://content.decentraland.today/contents/QmebeSZq8QxGZBgBgRQnm3JV94mRtt7zqUy28hzTc3ZuDH'
  },
  {
    name: 'nature',
    thumbnail: 'https://content.decentraland.today/contents/QmYFWdh5yJnrg4VuXPniDd8HHbVrfV2FPn35RPdVYVMLjg'
  },
  {
    name: 'structures',
    thumbnail: 'https://content.decentraland.today/contents/Qme15L6oTnjfAuCs9ayTDPNEBhPRJukcLVFDNw43UXUaLA'
  },
  {
    name: 'decorations',
    thumbnail: 'https://content.decentraland.today/contents/Qmd7N96rupxCLr3mWwRfgsM6Pwnf7k2SUemvxTjYvSddgN'
  },
  {
    name: 'year of the pig',
    thumbnail: 'https://content.decentraland.today/contents/QmeHgdLkKaRLpFKPECUxQTEb3NEHbcKkgCcjhBq693d62n'
  }
]
