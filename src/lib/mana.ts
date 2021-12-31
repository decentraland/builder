import { ChainId } from '@dcl/schemas'
import { Authorization, AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { ContractName, getContract } from 'decentraland-transactions'

const MANA_SYMBOL = '⏣'

export function addSymbol(num: string | number) {
  return num > 0 ? `${MANA_SYMBOL} ${num.toString()}` : ''
}

export function buildManaAuthorization(address: string, chainId: ChainId, contractName: ContractName): Authorization {
  const manaContractAddress = getContract(ContractName.MANAToken, chainId).address
  const toAuthorizeContractAdresss = getContract(contractName, chainId).address

  return {
    type: AuthorizationType.ALLOWANCE,
    address: address,
    contractName: ContractName.MANAToken,
    contractAddress: manaContractAddress,
    authorizedAddress: toAuthorizeContractAdresss,
    chainId
  }
}
