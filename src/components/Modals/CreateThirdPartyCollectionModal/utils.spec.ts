import { ChainId, ContractNetwork } from '@dcl/schemas'
import { fromContractNetworkToChainId, isTestNetwork } from './utils'

describe('when checking if a network is a test network', () => {
  describe.each([
    [ContractNetwork.AMOY, true],
    [ContractNetwork.MAINNET, false],
    [ContractNetwork.MATIC, false],
    [ContractNetwork.SEPOLIA, true]
  ])('and the network is %s', (network, isTest) => {
    it(`should return ${isTest}`, () => {
      expect(isTestNetwork(network)).toBe(isTest)
    })
  })
})

describe('when converting from a contract network to a chain id', () => {
  describe.each([
    [ContractNetwork.MAINNET, ChainId.ETHEREUM_MAINNET],
    [ContractNetwork.MATIC, ChainId.MATIC_MAINNET],
    [ContractNetwork.AMOY, ChainId.MATIC_AMOY],
    [ContractNetwork.SEPOLIA, ChainId.ETHEREUM_SEPOLIA]
  ])('and the network is %s', (network, chainId) => {
    it(`should return ${chainId}`, () => {
      expect(fromContractNetworkToChainId(network)).toBe(chainId)
    })
  })
})
