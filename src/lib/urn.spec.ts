import { ChainId, Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { buildItemURN, getCatalystItemURN, pop, join } from './urn'

jest.mock('decentraland-dapps/dist/lib/eth')

afterEach(() => jest.resetAllMocks())

describe('buildItemURN', () => {
  it('should build a valid URN with the item data', () => {
    expect(buildItemURN('wearable', 'my-name', 'my-desc', 'great-category', 'baseMale,baseFemale')).toBe(
      '1:w:my-name:my-desc:great-category:baseMale,baseFemale'
    )
  })
})

describe('getCatalystItemURN', () => {
  beforeEach(() => {
    ;(getChainIdByNetwork as jest.Mock).mockReturnValueOnce(ChainId.MATIC_MAINNET)
  })

  it('should use the supplied data to generate a valid item URN', () => {
    expect(getCatalystItemURN('0x123123', 'token-id')).toBe('urn:decentraland:matic:collections-v2:0x123123:token-id')
    expect(getChainIdByNetwork).toHaveBeenCalledWith(Network.MATIC)
  })
})

describe('pop', () => {
  it('should get the last URN part', () => {
    expect(pop('this:is:some:urn:getme')).toBe('getme')
  })
})

describe('join', () => {
  it('should join all parts into a URN', () => {
    expect(join('this', 'is', 'new')).toBe('this:is:new')
  })

  it('should return an empty string if no arg is supplied', () => {
    expect(join()).toBe('')
  })
})
