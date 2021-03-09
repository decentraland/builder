import { ChainId } from '@dcl/schemas'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { isEqual } from 'lib/address'

export function getContractName(address: string) {
  const { contract } = findContract(address) // ChainId not used in this case
  if (!contract) {
    throw new Error(`Could not find a valid contract name for address ${address}`)
  }
  return contract.name
}

export function getContractSymbol(address: string, chainId: ChainId) {
  const { contract, contractName } = findContract(address, chainId)
  if (!contract || !contractName) {
    throw new Error(`Could not find a valid contract symbol for address ${address}`)
  }

  const symbols: Partial<Record<ContractName, string>> = {
    [ContractName.MANAToken]: 'MANA'
  }

  const symbol = symbols[contractName]
  if (!symbol) {
    throw new Error(`Could not find a valid symbol for contract ${contract.name} using address ${address}`)
  }
  return symbol
}

function findContract(address: string, chainId?: ChainId): Partial<{ contract: ContractData; contractName: ContractName }> {
  const chainIds = chainId ? [chainId] : (Object.values(ChainId) as ChainId[])

  for (const contractName of Object.values(ContractName)) {
    for (const chain of chainIds) {
      try {
        const contract = getContract(contractName as ContractName, chain)
        if (isEqual(contract.address, address)) {
          return { contract, contractName }
        }
      } catch (error) {
        continue
      }
    }
  }
  return {}
}
