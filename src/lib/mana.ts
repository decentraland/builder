const MANA_SYMBOL = '⏣'

export function addSymbol(num: number) {
  return num > 0 ? `${MANA_SYMBOL} ${num.toString()}` : ''
}
