import { ChainId, ContractNetwork } from '@dcl/schemas'

// Chain IDs for networks not yet in the installed @dcl/schemas version.
// These will be replaced with ChainId enum members once the upstream
// @dcl/schemas PR adding BASE/APE/MONAD chains is released.
const BASE_MAINNET_CHAIN_ID = 8453
const BASE_SEPOLIA_CHAIN_ID = 84532
const APE_MAINNET_CHAIN_ID = 33139
const APE_CALDERA_CHAIN_ID = 33111
const MONAD_TESTNET_CHAIN_ID = 10143

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
    case ContractNetwork.BASE_MAINNET:
      return BASE_MAINNET_CHAIN_ID
    case ContractNetwork.BASE_SEPOLIA:
      return BASE_SEPOLIA_CHAIN_ID
    case ContractNetwork.APE_MAINNET:
      return APE_MAINNET_CHAIN_ID
    case ContractNetwork.APE_CALDERA:
      return APE_CALDERA_CHAIN_ID
    case ContractNetwork.MONAD_MAINNET:
      // MONAD_MAINNET chain ID is not yet finalised upstream; treat as unsupported.
      throw new Error('MONAD_MAINNET chain ID is not yet available')
    case ContractNetwork.MONAD_TESTNET:
      return MONAD_TESTNET_CHAIN_ID
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
