const MANA_SYMBOL = '⏣'

export function addSymbol(num: string | number) {
  return num > 0 ? `${MANA_SYMBOL} ${num.toString()}` : ''
}
