import { getSetCollectionMintersTranslationId } from './Transaction'

const SALE_ADDRESS = '0x214ffc0f0103735728dc66b61a22e4f163e275ae'
const OTHER_MINTER = '0x9d32aac179153a991e832550d9f96441ea27763a'

/**
 * The two address lists reaching this decision come from different places and used to be compared with a
 * case-sensitive diff. The saga normalizes the transaction's minters; the collection snapshot is whatever
 * the server returned, which may be checksummed.
 */
describe('when deciding what a setMinters transaction did', () => {
  describe('and the sale address was removed', () => {
    let minters: string[]
    let previousMinters: string[]

    beforeEach(() => {
      minters = [OTHER_MINTER]
      previousMinters = [OTHER_MINTER, SALE_ADDRESS]
    })

    it('should report the collection as taken off sale', () => {
      expect(getSetCollectionMintersTranslationId(minters, previousMinters, SALE_ADDRESS)).toBe('transaction.unset_collection_on_sale')
    })
  })

  describe('and the sale address was added', () => {
    let minters: string[]
    let previousMinters: string[]

    beforeEach(() => {
      minters = [OTHER_MINTER, SALE_ADDRESS]
      previousMinters = [OTHER_MINTER]
    })

    it('should report the collection as put on sale', () => {
      expect(getSetCollectionMintersTranslationId(minters, previousMinters, SALE_ADDRESS)).toBe('transaction.set_collection_on_sale')
    })
  })

  describe('and the snapshot spells the untouched minters in a different case', () => {
    let minters: string[]
    let previousMinters: string[]

    beforeEach(() => {
      // The sale address is untouched — it is simply checksummed on one side. A case-sensitive diff put it
      // in BOTH the added and removed sets, and the removed branch is checked first, so every minters
      // transaction on such a collection read as "unset collection on sale".
      minters = [SALE_ADDRESS, OTHER_MINTER]
      previousMinters = [SALE_ADDRESS.toUpperCase().replace('0X', '0x'), OTHER_MINTER]
    })

    it('should not report a sale change that did not happen', () => {
      expect(getSetCollectionMintersTranslationId(minters, previousMinters, SALE_ADDRESS)).toBe('transaction.updated_collection_minters')
    })
  })
})
