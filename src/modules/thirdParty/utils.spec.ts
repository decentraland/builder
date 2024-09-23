import type { Provider } from 'decentraland-connect'
import type { ChainLinkOracle } from 'contracts/ChainLinkOracle'
import type { ThirdPartyRegistry } from 'contracts/ThirdPartyRegistry'
import { ethers } from 'ethers'
import { ChainId, ContractNetwork, Mapping, Mappings, MappingType } from '@dcl/schemas'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { ChainLinkOracle__factory, ThirdPartyRegistry__factory } from 'contracts/factories'
import { areMappingsEqual, areMappingsValid, convertThirdPartyMetadataToRawMetadata, getThirdPartyPrice } from './utils'
import { LinkedContract } from './types'

jest.mock('decentraland-dapps/dist/lib/eth')
jest.mock('contracts/factories')

const mockedGetChainIdByNetwork: jest.MockedFn<typeof getChainIdByNetwork> = getChainIdByNetwork as jest.MockedFn<
  typeof getChainIdByNetwork
>
const mockedGetNetworkProvider: jest.MockedFn<typeof getNetworkProvider> = getNetworkProvider as jest.MockedFn<typeof getNetworkProvider>
const mockedChainLinkOracleConnect = jest.mocked(ChainLinkOracle__factory.connect)
const mockedThirdPartyRegistryConnect = jest.mocked(ThirdPartyRegistry__factory.connect)

describe('when checking if some mappings are valid', () => {
  let mappings: Mappings

  describe('and the mappings are valid', () => {
    beforeEach(() => {
      mappings = {
        [ContractNetwork.AMOY]: {
          '0x74c78f5A4ab22F01d5fd08455cf0Ff5C3367535C': [
            {
              type: MappingType.SINGLE,
              id: '123'
            }
          ]
        }
      }
    })

    it('should return true', () => {
      expect(areMappingsValid(mappings)).toBe(true)
    })
  })

  describe('and the mapping is not valid', () => {
    beforeEach(() => {
      mappings = {
        [ContractNetwork.AMOY]: {
          '0x74': [
            {
              type: MappingType.SINGLE,
              id: '123'
            }
          ]
        }
      }
    })

    it('should return false', () => {
      expect(areMappingsValid(mappings)).toBe(false)
    })
  })
})

describe('when checking if two mappings are equal', () => {
  let fstMapping: Mapping
  let sndMapping: Mapping

  describe('and the type is different', () => {
    beforeEach(() => {
      fstMapping = {
        type: MappingType.ANY
      }
      sndMapping = {
        type: MappingType.SINGLE,
        id: '123'
      }
    })

    it('should return false', () => {
      expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
    })
  })

  describe('and both mappings are of type ANY', () => {
    beforeEach(() => {
      fstMapping = {
        type: MappingType.ANY
      }
      sndMapping = {
        type: MappingType.ANY
      }
    })

    it('should return true', () => {
      expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
    })
  })

  describe('and both mappings are of type SINGLE', () => {
    describe('and the ids are different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.SINGLE,
          id: '123'
        }
        sndMapping = {
          type: MappingType.SINGLE,
          id: '456'
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the ids are equal', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.SINGLE,
          id: '123'
        }
        sndMapping = {
          type: MappingType.SINGLE,
          id: '123'
        }
      })

      it('should return true', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
      })
    })
  })

  describe('and bot mappings are of type RANGE', () => {
    describe('and the from property is different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
        sndMapping = {
          type: MappingType.RANGE,
          from: '456',
          to: '456'
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the to property is different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
        sndMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '789'
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the ranges are equal', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
        sndMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
      })

      it('should return true', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
      })
    })
  })

  describe('and both mappings are of type MULTIPLE', () => {
    describe('and the ids are different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.MULTIPLE,
          ids: ['123', '456']
        }
        sndMapping = {
          type: MappingType.MULTIPLE,
          ids: ['456', '123']
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the ids are equal', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.MULTIPLE,
          ids: ['123', '456']
        }
        sndMapping = {
          type: MappingType.MULTIPLE,
          ids: ['123', '456']
        }
      })

      it('should return true', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
      })
    })
  })
})

describe('when converting third party metadata to raw metadata', () => {
  let name: string
  let description: string
  let contracts: LinkedContract[]

  beforeEach(() => {
    name = 'a name'
    description = 'a description'
  })

  describe('and the metadata has contracts', () => {
    beforeEach(() => {
      contracts = [{ network: ContractNetwork.AMOY, address: '0x0' }]
    })

    it('should return the raw metadata with the contract', () => {
      expect(convertThirdPartyMetadataToRawMetadata(name, description, contracts)).toEqual('tp:1:a name:a description:amoy-0x0')
    })
  })

  describe('and the metadata does not have contracts', () => {
    beforeEach(() => {
      contracts = []
    })

    it('should return the raw metadata without the contract', () => {
      expect(convertThirdPartyMetadataToRawMetadata(name, description, contracts)).toEqual('tp:1:a name:a description')
    })
  })
})

describe('when getting the third party price', () => {
  let error: Error
  let mockedGetRate: jest.MockedFn<ChainLinkOracle['getRate']>
  let mockedItemSlotPrice: jest.MockedFn<ThirdPartyRegistry['itemSlotPrice']>
  let mockedProgrammaticBasePurchasedSlots: jest.MockedFn<ThirdPartyRegistry['programmaticBasePurchasedSlots']>

  beforeEach(() => {
    mockedGetChainIdByNetwork.mockReturnValueOnce(ChainId.MATIC_AMOY)
    mockedGetRate = jest.fn()
    mockedItemSlotPrice = jest.fn()
    mockedProgrammaticBasePurchasedSlots = jest.fn()
    const mockedChainLinkOracleContract = {
      getRate: mockedGetRate
    } as unknown as ChainLinkOracle
    mockedChainLinkOracleConnect.mockReturnValue(mockedChainLinkOracleContract)
    const mockedThirdPartyRegistryContract = {
      itemSlotPrice: mockedItemSlotPrice,
      programmaticBasePurchasedSlots: mockedProgrammaticBasePurchasedSlots
    } as unknown as ThirdPartyRegistry
    mockedThirdPartyRegistryConnect.mockReturnValue(mockedThirdPartyRegistryContract)
  })

  describe('and getting the network provider fails', () => {
    beforeEach(() => {
      error = new Error('anError')
      mockedGetNetworkProvider.mockRejectedValueOnce(error)
    })

    it('should propagate the error', async () => {
      return expect(getThirdPartyPrice()).rejects.toThrow(error)
    })
  })

  describe('and getting the network provider succeeds', () => {
    beforeEach(() => {
      mockedGetNetworkProvider.mockResolvedValueOnce({ isMetamask: false, request: jest.fn() as Provider['request'] } as Provider)
    })

    describe('and getting the rate fails', () => {
      beforeEach(() => {
        error = new Error('anError')
        mockedGetRate.mockRejectedValueOnce(error)
        mockedItemSlotPrice.mockResolvedValueOnce(ethers.BigNumber.from('1'))
        mockedProgrammaticBasePurchasedSlots.mockResolvedValueOnce(ethers.BigNumber.from('1'))
      })

      it('should propagate the error', () => {
        return expect(getThirdPartyPrice()).rejects.toThrow(error)
      })
    })

    describe('and getting the item slots price fails', () => {
      beforeEach(() => {
        error = new Error('anError')
        mockedGetRate.mockResolvedValueOnce(ethers.BigNumber.from('1'))
        mockedItemSlotPrice.mockRejectedValueOnce(error)
        mockedProgrammaticBasePurchasedSlots.mockResolvedValueOnce(ethers.BigNumber.from('1'))
      })

      it('should propagate the error', () => {
        return expect(getThirdPartyPrice()).rejects.toThrow(error)
      })
    })

    describe('and getting the programmatic price fails', () => {
      beforeEach(() => {
        error = new Error('anError')
        mockedGetRate.mockResolvedValueOnce(ethers.BigNumber.from('1'))
        mockedItemSlotPrice.mockResolvedValueOnce(ethers.BigNumber.from('1'))
        mockedProgrammaticBasePurchasedSlots.mockRejectedValueOnce(error)
      })

      it('should propagate the error', () => {
        return expect(getThirdPartyPrice()).rejects.toThrow(error)
      })
    })

    describe('and all the calls are successful', () => {
      beforeEach(() => {
        mockedGetRate.mockResolvedValueOnce(ethers.BigNumber.from('500000000000000000'))
        mockedItemSlotPrice.mockResolvedValueOnce(ethers.BigNumber.from('100000000000000000000'))
        mockedProgrammaticBasePurchasedSlots.mockResolvedValueOnce(ethers.BigNumber.from('200000000000000000000'))
      })

      it('should return the third party price', () => {
        return expect(getThirdPartyPrice()).resolves.toEqual({
          item: {
            usd: '100000000000000000000',
            mana: '200000000000000000000'
          },
          programmatic: {
            usd: '20000000000000000000000',
            mana: '40000000000000000000000'
          }
        })
      })
    })
  })
})
