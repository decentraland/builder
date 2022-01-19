import { Wearable } from 'decentraland-ecs'
import { CatalystWearable } from 'modules/editor/types'
import { WearableBodyShape, WearableCategory } from 'modules/item/types'

export const wearable: Wearable = {
  id: 'urn:decentraland:off-chain:base-avatars:aviatorstyle',
  type: 'wearable',
  category: 'eyewear',
  baseUrl: 'https://peer-ec1.decentraland.org/content/contents/',
  tags: ['accesories', 'male', 'man', 'base-wearable'],
  representations: [
    {
      bodyShapes: ['urn:decentraland:off-chain:base-avatars:BaseMale'],
      mainFile: 'M_Eyewear_AviatorStyle.glb',
      contents: [
        {
          file: 'AvatarWearables_TX.png',
          hash: 'QmYktkLr5rnn9zPPARkavhVowvTNTih8uWq8BVscTGxtZD'
        },
        {
          file: 'M_Eyewear_AviatorStyle.glb',
          hash: 'QmXb4PnGmkpTLEfbrFrkupXjxj1AafyEX3k53iFnjsSmAk'
        }
      ]
    }
  ]
}

export const anotherWearable: Wearable = {
  id: 'urn:decentraland:off-chain:base-avatars:baggy_pullover',
  type: 'wearable',
  category: 'upper_body',
  baseUrl: 'https://peer-ec1.decentraland.org/content/contents/',
  tags: ['top', 'female', 'woman', 'base-wearable'],
  representations: [
    {
      bodyShapes: ['urn:decentraland:off-chain:base-avatars:BaseFemale'],
      mainFile: 'F_uBody_SolidPullover.glb',
      contents: [
        { file: 'AvatarWearables_TX.png', hash: 'QmYktkLr5rnn9zPPARkavhVowvTNTih8uWq8BVscTGxtZD' },
        { file: 'Avatar_FemaleSkinBase.png', hash: 'QmaiQWdDy53GeRTUqGZywEe12w7F9urfogC6TGt4MWt3Q2' },
        {
          file: 'F_uBody_SolidPullover.glb"',
          hash: 'Qmc4ee9gbdJ4fBr2R8FjU5oErWzQAiMvQ8T5xDTBbYXnmv'
        }
      ]
    }
  ]
}

export const catalystWearable: CatalystWearable = {
  id: 'urn:decentraland:off-chain:base-avatars:aviatorstyle',
  description: '',
  thumbnail: 'https://peer-ec1.decentraland.org/content/contents/QmWEr5ttPDezxMjDHU1UKPPukHjLiNEi1EjznmaUXiaHgn',
  rarity: '',
  data: {
    tags: ['accesories', 'male', 'man', 'base-wearable'],
    category: WearableCategory.EYEWEAR,
    representations: [
      {
        bodyShapes: ['urn:decentraland:off-chain:base-avatars:BaseMale' as WearableBodyShape],
        mainFile: 'M_Eyewear_AviatorStyle.glb',
        overrideReplaces: [],
        overrideHides: [],
        contents: [
          {
            key: 'AvatarWearables_TX.png',
            url: 'https://peer-ec1.decentraland.org/content/contents/QmYktkLr5rnn9zPPARkavhVowvTNTih8uWq8BVscTGxtZD'
          },
          {
            key: 'M_Eyewear_AviatorStyle.glb',
            url: 'https://peer-ec1.decentraland.org/content/contents/QmXb4PnGmkpTLEfbrFrkupXjxj1AafyEX3k53iFnjsSmAk'
          }
        ]
      }
    ]
  },
  i18n: [
    { code: 'en', text: 'Aviator Sunglasses' },
    { code: 'es', text: 'Gafas de Aviador' }
  ],
  createdAt: 1637005585914,
  updatedAt: 1637005585914
}

export function convertWearable(wearable: Wearable, category: WearableCategory, bodyShape: WearableBodyShape): Wearable {
  return {
    ...wearable,
    category,
    representations: wearable.representations.map(representation => ({ ...representation, bodyShapes: [bodyShape] }))
  }
}
