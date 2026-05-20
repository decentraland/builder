import { ChainId, ContractNetwork } from '@dcl/schemas'

export function fromContractNetworkToChainId(network: ContractNetwork): ChainId | number {
  switch (network) {
    case ContractNetwork.MAINNET:
      return ChainId.ETHEREUM_MAINNET
    case ContractNetwork.MATIC:
      return ChainId.MATIC_MAINNET
    case ContractNetwork.AMOY:
      return ChainId.MATIC_AMOY
    case ContractNetwork.SEPOLIA:
      return ChainId.ETHEREUM_SEPOLIA
    default:
      throw new Error(`Unsupported network: ${network}`)
  }
}

export function isTestNetwork(network: ContractNetwork): boolean {
  return (
    network === ContractNetwork.AMOY ||
    network === ContractNetwork.SEPOLIA ||
    network === ContractNetwork.BASE_SEPOLIA ||
    network === ContractNetwork.APE_CALDERA ||
    network === ContractNetwork.MONAD_TESTNET
  )
}
