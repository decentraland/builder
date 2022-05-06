import { mockedItem } from 'specs/item'
import { hasOldHashedContents, isOldHash } from './export'
import { Item } from './types'

describe('when checking if a hash was generated with an older algorithm', () => {
  describe('and the hash was generated with an older algorithm', () => {
    it('should return true', () => {
      expect(isOldHash('QmVMJ6skaVVKN61NkB4RUrXj1LZ4oF7X74wwaTwxrrtAVy')).toBe(true)
    })
  })

  describe('and the hash was generated with a newer algorithm', () => {
    it('should return false', () => {
      expect(isOldHash('bafybeib42stvo6a5dxxaj4uzolicqeedv2u3cfpoo2d2qylz332zc2w5ra')).toBe(false)
    })
  })
})

describe('when checking if an item has hashed contents with an older algorithm', () => {
  let item: Item

  beforeEach(() => {
    item = { ...mockedItem }
  })

  describe('and the item has its contents hashed with and old algorithm', () => {
    beforeEach(() => {
      item = {
        ...item,
        contents: Object.fromEntries(Object.entries(item.contents).map(([key]) => [key, 'Qmf7dnGi5fyF9AwdJGzVnFCUUGBB8w2mW1v6AZAWh7rJVd']))
      }
    })

    it('should return true', () => {
      expect(hasOldHashedContents(item)).toBe(true)
    })
  })

  describe('and the item has its contents hashed with a newer algorithm', () => {
    beforeEach(() => {
      item = {
        ...item,
        contents: Object.fromEntries(
          Object.entries(item.contents).map(([key]) => [key, 'bafkreih3bdgomxm4otdlm7c4jjwufkwa36qykud2s7cp6touxm24elcaxa'])
        )
      }
    })

    it('should return false', () => {
      expect(hasOldHashedContents(item)).toBe(false)
    })
  })
})
