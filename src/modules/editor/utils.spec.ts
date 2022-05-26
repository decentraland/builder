import { Locale, WearableBodyShape, WearableCategory, WearableDefinition } from '@dcl/schemas'
import { Color4, Wearable } from 'decentraland-ecs'
import { Item, ItemType } from 'modules/item/types'
import { getSkinHiddenCategories } from 'modules/item/utils'
import { convertWearable, wearable, catalystWearable } from 'specs/editor'
import { CatalystWearable, PatchedWearable } from './types'
import {
  extractBaseUrl,
  extractHash,
  filterWearables,
  fromCatalystWearableToWearable,
  patchWearables,
  toBase64,
  toHex,
  toWearable
} from './utils'

describe('when extracting the base URL of a wearable', () => {
  describe("and the URL doesn't contain the /content/content path with a hash", () => {
    it("should throw an error signaling that the base URL wasn't found", () => {
      expect(() => extractBaseUrl('https://something.com')).toThrowError('No base URL found in th URL: https://something.com')
    })
  })

  describe('and the URL contains the /content/content path with a hash', () => {
    it('should return the base URL', () => {
      expect(extractBaseUrl('https://peer-ec1.decentraland.org/content/contents/QmYktkLr5rnn9zPPARkavhVowvTNTih8uWq8BVscTGxtZD')).toEqual(
        'https://peer-ec1.decentraland.org/content/contents/'
      )
    })
  })
})

describe('when extracting the hash of a wearable', () => {
  describe("and the URL doesn't contain the /content/content path with a hash", () => {
    it("should throw an error signaling that the hash wasn't found", () => {
      expect(() => extractHash('https://something.com')).toThrowError('No hash found in the URL: https://something.com')
    })
  })

  describe('and the URL contains the /content/content path with a hash', () => {
    it('should return the hash', () => {
      expect(extractHash('https://peer-ec1.decentraland.org/content/contents/QmYktkLr5rnn9zPPARkavhVowvTNTih8uWq8BVscTGxtZD')).toEqual(
        'QmYktkLr5rnn9zPPARkavhVowvTNTih8uWq8BVscTGxtZD'
      )
    })
  })
})

describe('when filtering wearables', () => {
  let wearables: Wearable[]

  describe('and the list of wearables is empty', () => {
    beforeEach(() => {
      wearables = []
    })

    it('should return an empty list', () => {
      expect(filterWearables(wearables, WearableCategory.EARRING, WearableBodyShape.MALE)).toEqual([])
    })
  })

  describe("and the list of wearables doesn't contain one with the specified body shape or category", () => {
    beforeEach(() => {
      wearables = [
        convertWearable(wearable, WearableCategory.EARRING, WearableBodyShape.FEMALE),
        convertWearable(wearable, WearableCategory.LOWER_BODY, WearableBodyShape.MALE)
      ]
    })

    it('should return an empty list', () => {
      expect(filterWearables(wearables, WearableCategory.EARRING, WearableBodyShape.MALE)).toEqual([])
    })
  })

  describe('and the list of wearables contains some wearables with the specified body shape or category', () => {
    let matchingWearable = convertWearable(wearable, WearableCategory.EARRING, WearableBodyShape.MALE)

    beforeEach(() => {
      wearables = [matchingWearable, convertWearable(wearable, WearableCategory.EARRING, WearableBodyShape.FEMALE)]
    })

    it('should return a list with the matching wearables', () => {
      expect(filterWearables(wearables, WearableCategory.EARRING, WearableBodyShape.MALE)).toEqual([matchingWearable])
    })
  })
})

describe('when converting a catalyst wearable to a wearable', () => {
  let aCatalystWearable: CatalystWearable
  let aWearable: Wearable

  beforeEach(() => {
    aCatalystWearable = { ...catalystWearable }
    aWearable = { ...wearable }
  })

  it('should return a wearable', () => {
    expect(fromCatalystWearableToWearable(aCatalystWearable)).toEqual(aWearable)
  })
})

describe('when patching wearables', () => {
  describe("and the category of the wearable is not 'skin'", () => {
    it('should not make changes to the wearable', () => {
      const wearables: Wearable[] = [
        {
          id: 'aWearable',
          category: WearableCategory.LOWER_BODY,
          baseUrl: '',
          tags: [],
          type: 'wearable',
          representations: [
            {
              bodyShapes: [],
              contents: [
                {
                  file: 'model.glb',
                  hash: 'Qmhash'
                }
              ],
              mainFile: 'model.glb'
            }
          ]
        } as Wearable
      ]
      const patchedWearables = patchWearables(wearables)
      expect(patchedWearables).toEqual(wearables)
    })
  })
  describe("and the category of the wearable is 'skin'", () => {
    it('should add the categories that are hidden by skin wearables to the hides list', () => {
      const hiddenCategories = getSkinHiddenCategories()
      const wearables: Wearable[] = [
        {
          id: 'aWearable',
          category: WearableCategory.SKIN,
          baseUrl: '',
          tags: [],
          type: 'wearable',
          representations: [
            {
              bodyShapes: [],
              contents: [
                {
                  file: 'model.glb',
                  hash: 'Qmhash'
                }
              ],
              mainFile: 'model.glb'
            }
          ]
        } as Wearable
      ]
      const patchedWearables = patchWearables(wearables)
      const patchedWearable = patchedWearables[0] as PatchedWearable
      expect(patchedWearable.hides).toEqual(hiddenCategories)
      expect(patchedWearable.representations[0].overrideHides).toEqual(hiddenCategories)
    })
    it('should not remove the categories in the hides list added by the creator', () => {
      const wearables: Wearable[] = [
        {
          id: 'aWearable',
          category: WearableCategory.SKIN,
          baseUrl: '',
          tags: [],
          type: 'wearable',
          hides: [WearableCategory.HAT, WearableCategory.EYEWEAR],
          representations: [
            {
              bodyShapes: [],
              contents: [
                {
                  file: 'model.glb',
                  hash: 'Qmhash'
                }
              ],
              mainFile: 'model.glb'
            }
          ]
        } as Wearable
      ]
      const patchedWearables = patchWearables(wearables)
      const patchedWearable = patchedWearables[0] as PatchedWearable
      expect(patchedWearable.hides).toContain(WearableCategory.HAT)
      expect(patchedWearable.hides).toContain(WearableCategory.EYEWEAR)
      expect(patchedWearable.representations[0].overrideHides).toContain(WearableCategory.HAT)
      expect(patchedWearable.representations[0].overrideHides).toContain(WearableCategory.EYEWEAR)
    })
  })
})

describe('when passing a Color4 to the toHex util', () => {
  let red: Color4
  let blue: Color4
  let green: Color4
  beforeAll(() => {
    red = new Color4(1, 0, 0, 0)
    blue = new Color4(0, 1, 0, 0)
    green = new Color4(0, 0, 1, 0)
  })
  it('should return the corresponding hex value for that color', () => {
    expect(toHex(red)).toBe('ff0000')
    expect(toHex(blue)).toBe('00ff00')
    expect(toHex(green)).toBe('0000ff')
  })
})

describe('when converting an item', () => {
  let item: Item
  beforeAll(() => {
    item = ({
      id: 'anItem',
      name: 'An Item',
      description: 'This is an item',
      contents: {
        'model.glb': 'bazhash1',
        'texture.png': 'bazhash2',
        'thumbnail.png': 'bazhash3',
        'image.png': 'bazhash4'
      },
      type: ItemType.WEARABLE,
      data: {
        category: WearableCategory.HAT,
        hides: [],
        replaces: [],
        tags: [],
        representations: [
          {
            bodyShapes: [WearableBodyShape.MALE],
            mainFile: 'model.glb',
            contents: ['model.glb', 'texture.png'],
            overrideHides: [],
            overrideReplaces: []
          }
        ]
      },
      thumbnail: 'thumbnail.png'
    } as unknown) as Item
  })
  describe('when using the toWearable util', () => {
    it('should return the wearable definition corresponding to that item', () => {
      const wearable = toWearable(item)
      expect(wearable.id).toBe('anItem')
      expect(wearable.name).toBe('An Item')
      expect(wearable.thumbnail).toBe('thumbnail.png')
      expect(wearable.i18n).toEqual([
        {
          code: Locale.EN,
          text: 'An Item'
        }
      ])
      expect(wearable.data.category).toBe(WearableCategory.HAT)
      expect(wearable.data.hides).toEqual([])
      expect(wearable.data.replaces).toEqual([])
      expect(wearable.data.tags).toEqual([])
      expect(wearable.data.representations).toHaveLength(1)
      expect(wearable.data.representations[0].mainFile).toBe('model.glb')
      expect(wearable.data.representations[0].contents).toHaveLength(2)
      expect(wearable.data.representations[0].contents[0].key).toBe('model.glb')
      expect(wearable.data.representations[0].contents[0].url).toMatch(new RegExp('/storage/contents/bazhash1$'))
      expect(wearable.data.representations[0].contents[1].key).toBe('texture.png')
      expect(wearable.data.representations[0].contents[1].url).toMatch(new RegExp('/storage/contents/bazhash2$'))
      expect(wearable.data.representations[0].overrideHides).toEqual([])
      expect(wearable.data.representations[0].overrideReplaces).toEqual([])
    })
  })
  describe('when using the toBase64 util', () => {
    it('should return the base64 encoded wearable definition for that item', () => {
      const base64 = toBase64(item)
      const ascii = atob(base64)
      const parsed: WearableDefinition = JSON.parse(ascii)
      const wearable = toWearable(item)
      expect(parsed).toEqual(wearable)
    })
    it('should work with items that use emojis', () => {
      const itemWithEmojis: Item = { ...item, name: 'Item with emoji 🍉', description: 'Description with emoji 🍉' }
      const base64 = toBase64(itemWithEmojis)
      const ascii = atob(base64)
      const parsed: WearableDefinition = JSON.parse(ascii)
      expect(parsed.name).toEqual('Item with emoji ')
      expect(parsed.description).toEqual('Description with emoji ')
    })
  })
})
