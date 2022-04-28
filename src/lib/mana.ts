import { ChainId } from '@dcl/schemas'
import { Authorization, AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { ContractName, getContract } from 'decentraland-transactions'

const MANA_SYMBOL = '⏣'
const MAXIMUM_FRACTION_DIGITS = 2

export function addSymbol(num: string | number) {
  return num > 0 ? `${MANA_SYMBOL} ${num.toString()}` : ''
}

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

/**
 * Get's value and tries to parse it with the supplied amount of decimals.
 * It'll return the value as is if it's an invalid number or it doesn't have more than decimals than the upper limit.
 */
export function toFixedMANAValue(strValue: string, maximumFractionDigits = MAXIMUM_FRACTION_DIGITS): string {
  const value = parseFloat(strValue)

  if (!isNaN(value)) {
    const decimals = value.toString().split('.')[1]
    const decimalsCount = decimals ? decimals.length : 0

    if (decimalsCount >= maximumFractionDigits) {
      return value.toFixed(maximumFractionDigits)
    }
  }

  return strValue
}
