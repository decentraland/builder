import { ethers } from 'ethers'
import { WorldInfo, WorldsAPI } from 'lib/api/worlds'
import { extractEntityId } from 'lib/urn'
import { ENS } from './types'
import {
  UNIVERSAL_RESOLVER_ADDRESS,
  addWorldStatusToEachENS,
  isExternalName,
  isSupportedENSResolver,
  resolveAddress,
  resolveContenthash,
  encodeENSName
} from './utils'

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
    'function contenthash(bytes32 node) view returns (bytes)',
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
        data: resolverInterface.encodeFunctionData('addr', [ethers.utils.namehash(name)]),
        ccipReadEnabled: true
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

describe('when encoding normalized ENS names', () => {
  let name: string

  beforeEach(() => {
    name = 'ALICE.eth'
  })

  it('should use the same normalized name for DNS and namehash', () => {
    expect(encodeENSName(name)).toEqual({
      name: 'alice.eth',
      dnsName: ethers.utils.dnsEncode('alice.eth'),
      node: ethers.utils.namehash('alice.eth')
    })
  })

  describe('and the name contains a valid long UTF-8 label', () => {
    beforeEach(() => {
      name = '😎'.repeat(20) + '.eth'
    })

    it('should accept labels exceeding the legacy 63-byte DNS limit', () => {
      expect(encodeENSName(name).dnsName.slice(0, 4)).toBe('0x50')
    })
  })

  describe('and the label exceeds the ENS wire format limit', () => {
    beforeEach(() => {
      name = '😎'.repeat(64) + '.eth'
    })

    it('should reject the name before attempting resolution', () => {
      expect(() => encodeENSName(name)).toThrow('255 bytes')
    })
  })
})

describe('when resolving content through an extended ENS resolver', () => {
  let provider: ethers.providers.Provider
  let call: jest.Mock
  let name: string
  let content: string
  let universalInterface: ethers.utils.Interface
  let resolverInterface: ethers.utils.Interface

  beforeEach(() => {
    name = 'alice.eth'
    content = '0xe30101701220' + '11'.repeat(32)
    universalInterface = new ethers.utils.Interface([
      'function requireResolver(bytes name) view returns ((bytes name, uint256 offset, bytes32 node, address resolver, bool extended) info)'
    ])
    resolverInterface = new ethers.utils.Interface([
      'function contenthash(bytes32 node) view returns (bytes)',
      'function resolve(bytes name, bytes data) view returns (bytes)'
    ])
    call = jest
      .fn()
      .mockResolvedValueOnce(
        universalInterface.encodeFunctionResult('requireResolver', [
          [ethers.utils.dnsEncode(name), 0, ethers.utils.namehash(name), '0x00000000000000000000000000000000000000aa', true]
        ])
      )
      .mockResolvedValueOnce(
        resolverInterface.encodeFunctionResult('resolve', [resolverInterface.encodeFunctionResult('contenthash', [content])])
      )
    provider = { call } as unknown as ethers.providers.Provider
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should unwrap the contenthash record returned by resolve', async () => {
    await expect(resolveContenthash(provider, name)).resolves.toBe(content)
  })
})

describe('when checking supported ENS resolver deployments', () => {
  it.each([
    ['0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63', 1],
    ['0xF29100983E058B709F3D539b0c765937B804AC15', 1],
    ['0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5', 11155111]
  ])('should accept verified deployment %s on chain %s', (address, chainId) => {
    expect(isSupportedENSResolver(String(address), Number(chainId))).toBe(true)
  })

  it.each([
    ['0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63', 11155111],
    ['0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5', 1],
    ['0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63', 137],
    ['0x0000000000000000000000000000000000000000', 1],
    ['0x00000000000000000000000000000000000000aa', 1],
    ['', 1]
  ])('should reject unsupported deployment %s on chain %s', (address, chainId) => {
    expect(isSupportedENSResolver(String(address), Number(chainId))).toBe(false)
  })
})
