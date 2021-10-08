import { Item } from 'modules/item/types'
import { Mint } from './types'
import { getTotalAmountOfMintedItems } from './utils'

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
  describe('when the collection does not have a lock', () => {
    it('should return false')
  })

  describe('when the collection is published', () => {
    it('should return false')
  })

  describe('when the collection has an expired lock and is published', () => {
    it('should return false')
  })

  describe('when the collection has a valid lock and is not published', () => {
    it('should return true')
  })
})
