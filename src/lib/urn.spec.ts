import { ChainId, Network, WearableBodyShape } from '@dcl/schemas'
import * as dappsEth from 'decentraland-dapps/dist/lib/eth'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { buildThirdPartyURN, buildCatalystItemURN, decodeURN, URNType, URNProtocol, extractThirdPartyTokenId, isThirdParty } from './urn'

jest.mock('decentraland-dapps/dist/lib/eth')

afterEach(() => jest.resetAllMocks())

describe('when getting the catalyst item URN', () => {
  let contractAddress = '0x123123'
  let tokenId = 'token-id'

  beforeEach(() => {
    ;(getChainIdByNetwork as jest.Mock).mockReturnValueOnce(ChainId.MATIC_MAINNET)
  })

  it('should use the supplied data to generate a valid item URN', () => {
    expect(buildCatalystItemURN(contractAddress, tokenId)).toBe('urn:decentraland:matic:collections-v2:0x123123:token-id')
  })

  it('should get the chain id for the matic network', () => {
    buildCatalystItemURN(contractAddress, tokenId)
    expect(getChainIdByNetwork).toHaveBeenCalledWith(Network.MATIC)
  })
})

describe('when building the third party URN', () => {
  let thirdPartyName = 'some-tp-name'
  let collectionId = 'the-collection-id'

  beforeEach(() => {
    ;(getChainIdByNetwork as jest.Mock).mockReturnValueOnce(ChainId.MATIC_MAINNET)
  })

  it('should return a valid third party collection urn', () => {
    expect(buildThirdPartyURN(thirdPartyName, collectionId)).toBe(
      'urn:decentraland:matic:collections-thirdparty:some-tp-name:the-collection-id'
    )
  })

  it('should get the chain id for the matic network', () => {
    buildThirdPartyURN(thirdPartyName, collectionId)
    expect(getChainIdByNetwork).toHaveBeenCalledWith(Network.MATIC)
  })

  describe('when supplying a token id', () => {
    let tokenId = 'a-wonderful-token-id'

    it('should return a valid third party item urn', () => {
      expect(buildThirdPartyURN(thirdPartyName, collectionId, tokenId)).toBe(
        'urn:decentraland:matic:collections-thirdparty:some-tp-name:the-collection-id:a-wonderful-token-id'
      )
    })

    it('should get the chain id for the matic network', () => {
      buildThirdPartyURN(thirdPartyName, collectionId, tokenId)
      expect(getChainIdByNetwork).toHaveBeenCalledWith(Network.MATIC)
    })
  })
})

describe('when decoding an URN', () => {
  describe('when the urn is empty', () => {
    it('should return false', () => {
      expect(isThirdParty()).toBe(false)
    })
  })

  describe('when the URN is invalid', () => {
    it('should throw an error', () => {
      let urn = 'invalid things here'
      expect(() => decodeURN(urn)).toThrow('Invalid URN: "invalid things here"')
    })
  })

  describe('when a valid base avatar urn is used', () => {
    it('should decode and return each group', () => {
      expect(decodeURN('urn:decentraland:off-chain:base-avatars:BaseMale')).toEqual({
        type: URNType.BASE_AVATARS,
        protocol: URNProtocol.OFF_CHAIN,
        suffix: 'BaseMale'
      })
    })
  })

  describe('when a valid collection v2 urn is used', () => {
    it('should decode and return each group', () => {
      expect(decodeURN('urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')).toEqual({
        type: URNType.COLLECTIONS_V2,
        protocol: URNProtocol.ROPSTEN,
        suffix: '0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
      })
    })
  })

  describe('when a valid third party', () => {
    let thirdPartyRecordURN = 'urn:decentraland:matic:collections-thirdparty:crypto-motors'

    describe('when third party record urn is used', () => {
      it('should decode and return each group', () => {
        expect(decodeURN(thirdPartyRecordURN)).toEqual({
          type: URNType.COLLECTIONS_THIRDPARTY,
          protocol: URNProtocol.MATIC,
          suffix: 'crypto-motors',
          thirdPartyName: 'crypto-motors',
          thirdPartyCollectionId: undefined,
          thirdPartyTokenId: undefined
        })
      })
    })

    describe('when third party collection urn is used', () => {
      it('should decode and return each group', () => {
        expect(decodeURN(thirdPartyRecordURN + ':tp-collection-id')).toEqual({
          type: URNType.COLLECTIONS_THIRDPARTY,
          protocol: URNProtocol.MATIC,
          suffix: 'crypto-motors:tp-collection-id',
          thirdPartyName: 'crypto-motors',
          thirdPartyCollectionId: 'tp-collection-id',
          thirdPartyTokenId: undefined
        })
      })
    })

    describe('when a third party item urn is used', () => {
      it('should decode and return each group', () => {
        expect(decodeURN(thirdPartyRecordURN + ':another-tp-collection-id:better-token-id')).toEqual({
          type: URNType.COLLECTIONS_THIRDPARTY,
          protocol: URNProtocol.MATIC,
          suffix: 'crypto-motors:another-tp-collection-id:better-token-id',
          thirdPartyName: 'crypto-motors',
          thirdPartyCollectionId: 'another-tp-collection-id',
          thirdPartyTokenId: 'better-token-id'
        })
      })
    })
  })
})

describe('when extracting the third party item token id from an URN', () => {
  describe('when the URN is not a valid third party URN', () => {
    it("should throw an error signaling that the URN doesn't belong to a third party", () => {
      expect(() =>
        extractThirdPartyTokenId('urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')
      ).toThrowError(
        'Tried to build a third party token for a non third party URN "urn:decentraland:ropsten:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8"'
      )
    })
  })

  describe('when the URN is a valid third party URN', () => {
    it('should extract the collection and token ids', () => {
      expect(extractThirdPartyTokenId('urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id:token-id')).toBe(
        'collection-id:token-id'
      )
    })
  })
})

describe('when checking if a collection is a third party', () => {
  let urn: string

  describe('when checking a base avatar URN', () => {
    beforeEach(() => {
      urn = WearableBodyShape.FEMALE.toString()
    })

    it('should return false', () => {
      expect(isThirdParty(urn)).toBe(false)
    })
  })

  describe('when checking a collections v2 URN', () => {
    beforeEach(() => {
      jest.spyOn(dappsEth, 'getChainIdByNetwork').mockReturnValueOnce(ChainId.MATIC_MAINNET)
      urn = buildCatalystItemURN('0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8', '22')
    })

    it('should return false', () => {
      expect(isThirdParty(urn)).toBe(false)
    })
  })

  describe('when checking a third party URN', () => {
    describe("when it's a collection", () => {
      beforeEach(() => {
        jest.spyOn(dappsEth, 'getChainIdByNetwork').mockReturnValueOnce(ChainId.MATIC_MAINNET)
        urn = buildThirdPartyURN('thirdpartyname', 'collection-id')
      })

      it('should return true', () => {
        expect(isThirdParty(urn)).toBe(true)
      })
    })

    describe("when it's an item", () => {
      beforeEach(() => {
        jest.spyOn(dappsEth, 'getChainIdByNetwork').mockReturnValueOnce(ChainId.MATIC_MAINNET)
        urn = buildThirdPartyURN('thirdpartyname', 'collection-id', '22')
      })

      it('should return true', () => {
        expect(isThirdParty(urn)).toBe(true)
      })
    })
  })
})
