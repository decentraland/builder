import { ChainId, Network, BodyShape } from '@dcl/schemas'
import * as dappsEth from 'decentraland-dapps/dist/lib/eth'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import {
  buildThirdPartyURN,
  buildCatalystItemURN,
  decodeURN,
  URNType,
  URNProtocol,
  extractThirdPartyTokenId,
  isThirdParty,
  extractEntityId,
  extractCollectionAddress,
  extractTokenId,
  DecodedURN,
  isThirdPartyCollectionDecodedUrn,
  decodedCollectionsUrnAreEqual,
  getDefaultThirdPartyUrnSuffix
} from './urn'

jest.mock('decentraland-dapps/dist/lib/eth')

afterEach(() => jest.resetAllMocks())

describe('when getting the catalyst item URN', () => {
  const contractAddress = '0x123123'
  const tokenId = 'token-id'

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
  const thirdPartyName = 'some-tp-name'
  const collectionId = 'the-collection-id'

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
    const tokenId = 'a-wonderful-token-id'

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
      const urn = 'invalid things here'
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
    describe('and the URN is a collection URN', () => {
      it('should decode and return each group', () => {
        expect(decodeURN('urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')).toEqual({
          type: URNType.COLLECTIONS_V2,
          protocol: URNProtocol.GOERLI,
          collectionAddress: '0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8',
          suffix: '0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
        })
      })
    })

    describe('and the URN is an item URN', () => {
      it('should decode and return each group', () => {
        expect(decodeURN('urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:tokenId')).toEqual({
          type: URNType.COLLECTIONS_V2,
          protocol: URNProtocol.GOERLI,
          tokenId: 'tokenId',
          collectionAddress: '0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8',
          suffix: '0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:tokenId'
        })
      })
    })
  })

  describe('when a valid third party', () => {
    const thirdPartyRecordURN = 'urn:decentraland:matic:collections-thirdparty:crypto-motors'

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

  describe('when a valid entity urn is used', () => {
    describe('and the URN is an entity with a baseUrl', () => {
      it('should decode and return each group', () => {
        expect(decodeURN('urn:decentraland:entity:anEntityId?=&baseUrl=https://aContentServerUrl')).toEqual({
          type: URNType.ENTITY,
          suffix: 'anEntityId?=&baseUrl=https://aContentServerUrl',
          entityId: 'anEntityId',
          baseUrl: 'https://aContentServerUrl'
        })
      })
    })

    describe('and the URN is only an entity', () => {
      it('should decode and return each group', () => {
        expect(decodeURN('urn:decentraland:entity:anEntityId')).toEqual({
          type: URNType.ENTITY,
          suffix: 'anEntityId',
          entityId: 'anEntityId'
        })
      })
    })
  })
})

describe('when extracting the third party item token id from an URN', () => {
  describe('when the URN is not a valid third party URN', () => {
    it("should throw an error signaling that the URN doesn't belong to a third party", () => {
      expect(() =>
        extractThirdPartyTokenId('urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')
      ).toThrowError(
        'Tried to build a third party token for a non third party URN "urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8"'
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
      urn = BodyShape.FEMALE.toString()
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

describe('when extracting the entity id from an URN', () => {
  describe('when the URN is not an entity URN', () => {
    it("should throw an error signaling that the URN doesn't belong to an entity", () => {
      expect(() => extractEntityId('urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')).toThrowError(
        'URN is not an entity URN'
      )
    })
  })

  describe('when the URN is an entity URN', () => {
    it('should extract the entity id', () => {
      expect(extractEntityId('urn:decentraland:entity:anEntityId')).toBe('anEntityId')
    })
  })
})

describe('when extracting the collection address from an URN', () => {
  it('should extract the collection address', () => {
    const urn = 'urn:decentraland:sepolia:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
    expect(extractCollectionAddress(urn)).toBe('0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')
  })

  it('should throw an error if the URN is not a collections-v2 URN', () => {
    const urn = 'urn:decentraland:sepolia:some-other-urn'
    expect(() => extractCollectionAddress(urn)).toThrowError('Invalid URN: "urn:decentraland:sepolia:some-other-urn"')
  })
})

describe('when extracting the token id from an URN', () => {
  describe('when the URN is not a collections-v2 URN', () => {
    it('should throw an error', () => {
      const urn = 'urn:decentraland:off-chain:base-avatars:BaseMale'
      expect(() => extractTokenId(urn)).toThrow('URN is not a collections-v2 URN')
    })
  })

  describe('when the URN is not an Item URN', () => {
    it('should throw an error', () => {
      const urn = 'urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
      expect(() => extractTokenId(urn)).toThrow('URN is not an Item URN')
    })
  })

  describe('when the URN is a valid collections-v2 Item URN', () => {
    it('should extract the collection address and token id', () => {
      const urn = 'urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:tokenId'
      expect(extractTokenId(urn)).toBe('0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:tokenId')
    })
  })
})

describe('when checking if a decoded URN belongs to a third party one', () => {
  describe('and the decoded URN does not belong to a third party', () => {
    let decodedUrn: DecodedURN

    beforeEach(() => {
      decodedUrn = decodeURN('urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')
    })

    it('should return false', () => {
      expect(isThirdPartyCollectionDecodedUrn(decodedUrn)).toBe(false)
    })
  })

  describe('and the decoded URN belongs to a third party', () => {
    let decodedUrn: DecodedURN

    beforeEach(() => {
      decodedUrn = decodeURN('urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id')
    })

    it('should return true', () => {
      expect(isThirdPartyCollectionDecodedUrn(decodedUrn)).toBe(true)
    })
  })
})

describe('when checking if two decoded collection URNs are equal', () => {
  let fistDecodedUrn: DecodedURN
  let secondDecodedUrn: DecodedURN

  describe('and the URNs are different', () => {
    beforeEach(() => {
      fistDecodedUrn = decodeURN('urn:decentraland:amoy:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')
      secondDecodedUrn = decodeURN('urn:decentraland:amoy:collections-v2:0x16a2040b2b1eeca12344f4e2b11260ae2ee2edc2')
    })

    it('should return false', () => {
      expect(decodedCollectionsUrnAreEqual(fistDecodedUrn, secondDecodedUrn)).toBe(false)
    })
  })

  describe('and the URNs are equal', () => {
    beforeEach(() => {
      fistDecodedUrn = decodeURN('urn:decentraland:amoy:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')
      secondDecodedUrn = decodeURN('urn:decentraland:amoy:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8')
    })

    it('should return true', () => {
      expect(decodedCollectionsUrnAreEqual(fistDecodedUrn, secondDecodedUrn)).toBe(true)
    })
  })
})

describe('when getting a default third party URN suffix', () => {
  describe('and the item name is empty', () => {
    it('should return a string with the "default" word plus 4 random hex characters', () => {
      expect(getDefaultThirdPartyUrnSuffix('')).toMatch(/^default-[0-9a-f]{4}$/)
    })
  })

  describe('and the item name is not empty', () => {
    it('should return a string with the sluggled item name plus 4 random hex characters', () => {
      expect(getDefaultThirdPartyUrnSuffix('a wonderful item: name')).toMatch(/^a-wonderful-item-name-[0-9a-f]{4}$/)
    })
  })
})
