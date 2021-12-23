import { Wearable } from 'decentraland-ecs'
import { WearableBodyShape, WearableCategory } from 'modules/item/types'
import { convertWearable, wearable, catalystWearable } from 'specs/editor'
import { CatalystWearable } from './types'
import { extractBaseUrl, extractHash, filterWearables, fromCatalystWearableToWearable } from './utils'

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
