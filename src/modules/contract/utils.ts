import { ContractName, getContract, getContractName } from 'decentraland-transactions'
import { config } from 'config'

export function getContractSymbol(address: string) {
  const contractName = getContractName(address)
  const symbols: Partial<Record<ContractName, string>> = {
    [ContractName.MANAToken]: 'MANA'
  }

  const symbol = symbols[contractName]
  if (!symbol) {
    throw new Error(`Could not find a valid symbol for contract ${contractName} using address ${address}`)
  }
  return symbol
}

export function getContractAddressForAppChainId(contractName: ContractName) {
  return getContract(contractName, Number(config.get('CHAIN_ID'))).address
}
