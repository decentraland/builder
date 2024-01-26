import { ChainId } from '@dcl/schemas'
import { Authorization, AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { ContractName, getContract } from 'decentraland-transactions'

export function buildManaAuthorization(address: string, chainId: ChainId, contractName: ContractName): Authorization {
  const manaContractAddress = getContract(ContractName.MANAToken, chainId).address
  const toAuthorizeContractAddress = getContract(contractName, chainId).address

  return {
    type: AuthorizationType.ALLOWANCE,
    address: address,
    contractName: ContractName.MANAToken,
    contractAddress: manaContractAddress,
    authorizedAddress: toAuthorizeContractAddress,
    chainId
  }
}
