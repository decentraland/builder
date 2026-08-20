import { ChainId, Network, TradeAssetType, TradeCreation, TradeType } from '@dcl/schemas'
import { generateTradeValues as dappsGenerateTradeValues } from 'decentraland-dapps/dist/lib/trades'
import { generateTradeValues, valueForAsset } from './trades'

const MANA_ON_AMOY = '0x7ad72b9f944ea9793cf4055d88f81138cc2c63a0'
const COLLECTION_ADDRESS = '0x08063a1b0da85fdae091cfb0c46f42a03dcc80cf'
const BENEFICIARY = '0x24e5f44999c151f08609f8e27b2238c773c4d020'

const erc20Trade: Omit<TradeCreation, 'signature'> = {
  signer: BENEFICIARY,
  network: Network.MATIC,
  chainId: ChainId.MATIC_AMOY,
  type: TradeType.PUBLIC_ITEM_ORDER,
  checks: {
    uses: 100,
    allowedRoot: '0x',
    contractSignatureIndex: 0,
    signerSignatureIndex: 0,
    effective: 1755600000000,
    expiration: 1787136000000,
    externalChecks: [],
    salt: '0x0123456789abcdef'
  },
  sent: [{ assetType: TradeAssetType.COLLECTION_ITEM, contractAddress: COLLECTION_ADDRESS, itemId: '0', extra: '' }],
  received: [
    { assetType: TradeAssetType.ERC20, contractAddress: MANA_ON_AMOY, amount: '100000000000000000000', extra: '', beneficiary: BENEFICIARY }
  ]
}

const usdPeggedTrade: Omit<TradeCreation, 'signature'> = {
  ...erc20Trade,
  received: [
    {
      assetType: TradeAssetType.USD_PEGGED_MANA,
      contractAddress: MANA_ON_AMOY,
      amount: '600000000000000000',
      extra: '',
      beneficiary: BENEFICIARY
    }
  ]
}

describe('when extracting the EIP-712 value of a trade asset', () => {
  it('should return the token id for an ERC721 asset', () => {
    expect(valueForAsset({ assetType: TradeAssetType.ERC721, tokenId: '42' })).toBe('42')
  })

  it('should return the item id for a collection item asset', () => {
    expect(valueForAsset({ assetType: TradeAssetType.COLLECTION_ITEM, itemId: '7' })).toBe('7')
  })

  it('should return the amount for an ERC20 asset', () => {
    expect(valueForAsset({ assetType: TradeAssetType.ERC20, amount: '1000' })).toBe('1000')
  })

  it('should return the amount for a USD-pegged asset', () => {
    expect(valueForAsset({ assetType: TradeAssetType.USD_PEGGED_MANA, amount: '600000000000000000' })).toBe('600000000000000000')
  })

  it('should throw on an unknown asset type instead of signing garbage', () => {
    expect(() => valueForAsset({ assetType: 99 as TradeAssetType })).toThrow('Unsupported assetType 99')
  })
})

describe('when generating the EIP-712 values of a trade', () => {
  it('should convert effective and expiration from milliseconds to seconds', () => {
    const values = generateTradeValues(erc20Trade)
    expect(values.checks.effective).toBe(1755600000)
    expect(values.checks.expiration).toBe(1787136000)
  })

  it('should zero-pad the salt and allowed root to 32 bytes', () => {
    const values = generateTradeValues(erc20Trade)
    expect(values.checks.salt).toBe('0x0000000000000000000000000000000000000000000000000123456789abcdef')
    expect(values.checks.allowedRoot).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
  })

  it('should use the amount as the value of a USD-pegged received asset', () => {
    const values = generateTradeValues(usdPeggedTrade)
    expect(values.received[0]).toEqual({
      assetType: TradeAssetType.USD_PEGGED_MANA,
      contractAddress: MANA_ON_AMOY,
      value: '600000000000000000',
      extra: '0x',
      beneficiary: BENEFICIARY
    })
  })

  // The whole point of this vendored module is to differ from decentraland-dapps ONLY on the
  // USD-pegged case. If this test breaks, MANA listings signed here no longer match what the
  // marketplace verifies.
  it('should produce byte-identical values to decentraland-dapps for an ERC20 trade', () => {
    expect(generateTradeValues(erc20Trade)).toEqual(dappsGenerateTradeValues(erc20Trade))
  })
})
