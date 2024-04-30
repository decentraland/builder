import { getResumedAddress } from './utils'

describe('when creating an ellipsis in the middle of an address', () => {
  let address: string

  beforeEach(() => {
    address = '0x1234567890abcdef1234567890abcdef12345678'
  })

  it('should return null', () => {
    expect(getResumedAddress(address)).toEqual('0x1234...345678')
  })
})
