import { DataByKey } from 'decentraland-dapps/dist/lib/types'

import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { AssetPack } from 'modules/assetPack/types'

export const NO_GROUND_ASSET_ID = 'NO_GROUND_ASSET_ID'
export const NO_GROUND_ASSET_PACK_ID = 'NO_GROUND_ASSET_PACK_ID'

export function addNoGroundAsset(assets: DataByKey<Asset>) {
  return {
    ...assets,
    [NO_GROUND_ASSET_ID]: {
      id: NO_GROUND_ASSET_ID,
      assetPackId: NO_GROUND_ASSET_PACK_ID,
      name: t('itemdrawer.no_ground'),
      category: GROUND_CATEGORY,
      thumbnail: '',
      url: '',
      tags: [GROUND_CATEGORY],
      variations: [],
      contents: {}
    }
  }
}

export function addNoGroundAssetPack(assetPacks: DataByKey<AssetPack>) {
  return {
    ...assetPacks,
    [NO_GROUND_ASSET_PACK_ID]: {
      id: NO_GROUND_ASSET_PACK_ID,
      title: t('itemdrawer.no_ground'),
      version: 0,
      assets: [NO_GROUND_ASSET_ID]
    }
  }
}
