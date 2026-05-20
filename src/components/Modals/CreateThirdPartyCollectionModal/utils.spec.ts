import { ChainId, ContractNetwork } from '@dcl/schemas'
import { fromContractNetworkToChainId, isTestNetwork } from './utils'

describe('when checking if a network is a test network', () => {
  describe.each([
    [ContractNetwork.AMOY, true],
    [ContractNetwork.MAINNET, false],
    [ContractNetwork.MATIC, false],
    [ContractNetwork.SEPOLIA, true],
    [ContractNetwork.BASE_MAINNET, false],
    [ContractNetwork.BASE_SEPOLIA, true],
    [ContractNetwork.APE_MAINNET, false],
    [ContractNetwork.APE_CALDERA, true],
    [ContractNetwork.MONAD_MAINNET, false],
    [ContractNetwork.MONAD_TESTNET, true]
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

  describe.each([
    [ContractNetwork.BASE_MAINNET],
    [ContractNetwork.BASE_SEPOLIA],
    [ContractNetwork.APE_MAINNET],
    [ContractNetwork.APE_CALDERA],
    [ContractNetwork.MONAD_MAINNET],
    [ContractNetwork.MONAD_TESTNET]
  ])('and the network is %s', network => {
    it(`should throw because the chain ID is not yet finalised`, () => {
      expect(() => fromContractNetworkToChainId(network)).toThrow()
    })
  })
})
