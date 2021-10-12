import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { Mint } from './types'
import { getTotalAmountOfMintedItems, isLocked } from './utils'

describe('when counting the amount of minted items', () => {
  let mints: Mint[]
  let item: Item

  beforeEach(() => {
    item = { id: 'anId' } as Item
  })

  describe('having no mints', () => {
    beforeEach(() => {
      mints = []
    })

    it('should return 0', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(0)
    })
  })

  describe('having one mint of amount 3', () => {
    beforeEach(() => {
      mints = [{ address: 'anAddress', amount: 3, item }]
    })

    it('should return 3', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(3)
    })
  })

  describe('having two mints of amount 2', () => {
    beforeEach(() => {
      mints = [
        { address: 'anAddress', amount: 2, item },
        { address: 'anotherAddress', amount: 2, item }
      ]
    })
    it('should return 4', () => {
      expect(getTotalAmountOfMintedItems(mints)).toBe(4)
    })
  })
})

describe('when checking collection locks', () => {
  let collection: Collection

  describe('when the collection does not have a lock', () => {
    beforeEach(() => {
      collection = { lock: undefined, isPublished: false } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection is published', () => {
    beforeEach(() => {
      collection = { lock: undefined, isPublished: false } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection has an expired lock and is published', () => {
    beforeEach(() => {
      const lock = Date.now() - 3 * 60 * 60 * 1000 // 3 days in milliseconds
      collection = { lock, isPublished: true } as Collection
    })
    it('should return false', () => {
      expect(isLocked(collection)).toBe(false)
    })
  })

  describe('when the collection has a valid lock and is not published', () => {
    beforeEach(() => {
      const lock = Date.now() - 2 * 60 * 1000 // 2 minutes in milliseconds
      collection = { lock, isPublished: false } as Collection
    })
    it('should return true', () => {
      expect(isLocked(collection)).toBe(true)
    })
  })
})
