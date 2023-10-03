import { fromBytesToMegabytes } from './utils'

describe('when converting from bytes to megabytes', () => {
  describe('when the number is 10000000', () => {
    it('should return 9.5367431640625', () => {
      expect(fromBytesToMegabytes(10000000)).toBe(9.5367431640625)
    })
  })
})
