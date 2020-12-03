import { toBN } from 'web3x-es/utils'

const MANA_SYMBOL = '⏣'

export function addSymbol(num: number) {
  return num > 0 ? `${MANA_SYMBOL} ${num.toString()}` : ''
}

export function getMaximumValue() {
  return toBN(2).pow(toBN(255))
}
