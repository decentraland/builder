import { ethers } from 'ethers'
import { WorldInfo, WorldsAPI } from 'lib/api/worlds'
import { extractEntityId } from 'lib/urn'
import { ENS } from './types'
import { UNIVERSAL_RESOLVER_ADDRESS, addWorldStatusToEachENS, isExternalName, resolveAddress } from './utils'

describe('when checking if a subdomain is an external subdomain', () => {
  let subdomain: string

  describe('when providing a dcl subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.dcl.eth'
    })

    it('should return false', () => {
      expect(isExternalName(subdomain)).toBe(false)
    })
  })

  describe('when providing a non dcl subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.eth'
    })

    it('should return true', () => {
      expect(isExternalName(subdomain)).toBe(true)
    })
  })

  describe('when providing a non dcl subdomain that ends with dcl', () => {
    beforeEach(() => {
      subdomain = 'name-dcl.eth'
    })

    it('should return true', () => {
      expect(isExternalName(subdomain)).toBe(true)
    })
  })
})

describe('when adding the world status to each ens', () => {
  let enss: ENS[]

  describe('when providing a list of enss', () => {
    let response: WorldInfo | null

    beforeEach(() => {
      enss = [
        {
          subdomain: 'name.dcl.eth'
        }
      ] as ENS[]
    })

    describe('when the fetch world request returns null', () => {
      beforeEach(() => {
        response = null

        jest.spyOn(WorldsAPI.prototype, 'fetchWorld').mockResolvedValue(response)
      })

      it('should return the enss with the world status set to null', async () => {
        expect(await addWorldStatusToEachENS(enss)).toEqual([{ ...enss[0], worldStatus: null }])
      })
    })

    describe('when the fetch world request returns the world info', () => {
      beforeEach(() => {
        response = {
          healthy: true,
          configurations: {
            scenesUrn: [
              'urn:decentraland:entity:bafkreiavjamezigndx7rq5ggwd3tg3c5hzrnvla5euukqs25ew2hs4gtte?=&baseUrl=https://worlds-content-server.decentraland.zone/contents/'
            ]
          }
        } as WorldInfo

        jest.spyOn(WorldsAPI.prototype, 'fetchWorld').mockResolvedValue(response)
      })

      it('should return the enss with the world status set', async () => {
        const healthy = response!.healthy
        const urn = response!.configurations.scenesUrn[0]

        expect(await addWorldStatusToEachENS(enss)).toEqual([
          {
            ...enss[0],
            worldStatus: {
              healthy,
              scene: {
                urn,
                entityId: extractEntityId(urn)
              }
            }
          }
        ])
      })
    })
  })
})

describe('when resolving the address of an ENS name', () => {
  const universalResolverInterface = new ethers.utils.Interface([
    'function requireResolver(bytes name) view returns ((bytes name, uint256 offset, bytes32 node, address resolver, bool extended) info)',
    'error ResolverNotFound(bytes name)',
    'error ResolverNotContract(bytes name, address resolver)',
    'error ResolverError(bytes errorData)'
  ])
  const resolverInterface = new ethers.utils.Interface([
    'function addr(bytes32 node) view returns (address)',
    'function resolve(bytes name, bytes data) view returns (bytes)'
  ])
  const name = 'someone.dcl.eth'
  const resolverAddress = ethers.utils.getAddress('0x00000000000000000000000000000000000000aa')
  const currentAddress = ethers.utils.getAddress('0x000000000000000000000000000000000000000b')

  let call: jest.Mock<Promise<string>, [ethers.providers.TransactionRequest]>
  let provider: ethers.providers.Provider

  function encodeRequireResolverResult(extended: boolean) {
    return universalResolverInterface.encodeFunctionResult('requireResolver', [
      [ethers.utils.dnsEncode(name), 0, ethers.utils.namehash(name), resolverAddress, extended]
    ])
  }

  function encodeAddrResult(address: string) {
    return resolverInterface.encodeFunctionResult('addr', [address])
  }

  beforeEach(() => {
    call = jest.fn()
    provider = { call } as unknown as ethers.providers.Provider
  })

  it("should ask the Universal Resolver for the name's current resolver with the DNS-encoded name", async () => {
    call.mockResolvedValueOnce(encodeRequireResolverResult(false)).mockResolvedValueOnce(encodeAddrResult(currentAddress))

    await resolveAddress(provider, name)

    expect(call).toHaveBeenNthCalledWith(1, {
      to: UNIVERSAL_RESOLVER_ADDRESS,
      data: universalResolverInterface.encodeFunctionData('requireResolver', [ethers.utils.dnsEncode(name)])
    })
  })

  describe('and the current resolver is not an extended resolver', () => {
    beforeEach(() => {
      call.mockResolvedValueOnce(encodeRequireResolverResult(false))
    })

    it('should request the address from the current resolver with the namehash', async () => {
      call.mockResolvedValueOnce(encodeAddrResult(currentAddress))

      await resolveAddress(provider, name)

      expect(call).toHaveBeenNthCalledWith(2, {
        to: resolverAddress,
        data: resolverInterface.encodeFunctionData('addr', [ethers.utils.namehash(name)])
      })
    })

    it('should return the address set on the current resolver', async () => {
      call.mockResolvedValueOnce(encodeAddrResult(currentAddress))

      await expect(resolveAddress(provider, name)).resolves.toBe(currentAddress)
    })

    describe('and the resolver has no address for the name', () => {
      it('should return undefined', async () => {
        call.mockResolvedValueOnce(encodeAddrResult(ethers.constants.AddressZero))

        await expect(resolveAddress(provider, name)).resolves.toBeUndefined()
      })
    })

    describe('and the resolver returns no data', () => {
      it('should return undefined', async () => {
        call.mockResolvedValueOnce('0x')

        await expect(resolveAddress(provider, name)).resolves.toBeUndefined()
      })
    })
  })

  describe('and the current resolver is an extended resolver', () => {
    beforeEach(() => {
      call.mockResolvedValueOnce(encodeRequireResolverResult(true))
    })

    it('should request the address through resolve() with the DNS-encoded name and CCIP-Read enabled', async () => {
      call.mockResolvedValueOnce(resolverInterface.encodeFunctionResult('resolve', [encodeAddrResult(currentAddress)]))

      await resolveAddress(provider, name)

      expect(call).toHaveBeenNthCalledWith(2, {
        to: resolverAddress,
        data: resolverInterface.encodeFunctionData('resolve', [
          ethers.utils.dnsEncode(name),
          resolverInterface.encodeFunctionData('addr', [ethers.utils.namehash(name)])
        ]),
        ccipReadEnabled: true
      })
    })

    it('should return the address decoded from the resolve() result', async () => {
      call.mockResolvedValueOnce(resolverInterface.encodeFunctionResult('resolve', [encodeAddrResult(currentAddress)]))

      await expect(resolveAddress(provider, name)).resolves.toBe(currentAddress)
    })

    it('should return undefined when the resolved address is the zero address', async () => {
      call.mockResolvedValueOnce(resolverInterface.encodeFunctionResult('resolve', [encodeAddrResult(ethers.constants.AddressZero)]))

      await expect(resolveAddress(provider, name)).resolves.toBeUndefined()
    })

    describe('and the offchain lookup fails', () => {
      it('should throw the lookup error', async () => {
        call.mockRejectedValueOnce(new Error('CCIP gateway error'))

        await expect(resolveAddress(provider, name)).rejects.toThrow('CCIP gateway error')
      })
    })
  })

  describe('and the name has no resolver', () => {
    it('should return undefined without querying a resolver', async () => {
      call.mockResolvedValueOnce(universalResolverInterface.encodeErrorResult('ResolverNotFound', [ethers.utils.dnsEncode(name)]))

      await expect(resolveAddress(provider, name)).resolves.toBeUndefined()
      expect(call).toHaveBeenCalledTimes(1)
    })
  })

  describe('and the name resolver is not a contract', () => {
    it('should return undefined', async () => {
      call.mockResolvedValueOnce(
        universalResolverInterface.encodeErrorResult('ResolverNotContract', [ethers.utils.dnsEncode(name), resolverAddress])
      )

      await expect(resolveAddress(provider, name)).resolves.toBeUndefined()
    })
  })

  describe('and the Universal Resolver reverts with another error', () => {
    it('should throw instead of reporting the name as not found', async () => {
      call.mockResolvedValueOnce(universalResolverInterface.encodeErrorResult('ResolverError', ['0x']))

      await expect(resolveAddress(provider, name)).rejects.toThrow()
    })
  })

  describe('and the RPC request fails', () => {
    it('should throw the RPC error', async () => {
      call.mockRejectedValueOnce(new Error('RPC unavailable'))

      await expect(resolveAddress(provider, name)).rejects.toThrow('RPC unavailable')
    })
  })
})
