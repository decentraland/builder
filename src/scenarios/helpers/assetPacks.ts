import * as uuid from 'uuid'
import { Asset } from 'modules/asset/types'
import { FullAssetPack } from 'modules/assetPack/types'

export function makeFakeAsset(assetPackId: string, category: string): Asset {
  return {
    id: uuid.v4(),
    name: 'Tree',
    thumbnail: 'https://content.decentraland.today/contents/Qme7Wdkprsi9U9nYHNJhVC89fdPjs9eaxemkb6oQwRCzo3',
    url: `${assetPackId}/Tree/Tree_StarterPack.gltf`,
    tags: [category],
    category,
    variations: [],
    contents: {
      'Tree/BaseColor.png': 'https://content.decentraland.today/contents/Qmd8vo4UKX5STvUHRzbEkRfxBopjVtAiqmoZE6AtxWCPzG',
      'Tree/Tree_StarterPack.bin': 'https://content.decentraland.today/contents/QmXUe1d2zunwcRDcAWuEzP3ZYEnJ48x9U5DYiEZJqmDXRk',
      'Tree/Tree_StarterPack.gltf': 'https://content.decentraland.today/contents/QmdmNp5MuRxkNAAsyFd7z3nFGYcPaeZQRjFDm4AphE7K4V'
    },
    assetPackId: assetPackId
  }
}

export function makeFakeAssetPack(assetCount: number = 1): FullAssetPack {
  const id = uuid.v4()
  const categories = ['nature', 'furniture', 'items', 'misc']

  let out: FullAssetPack = {
    id,
    title: 'Default Asset Pack',
    thumbnail: '',
    url: '',
    isLoaded: true,
    assets: []
  }

  for (let i = 0; i < assetCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    out.assets.push(makeFakeAsset(id, category))
  }

  return out
}
