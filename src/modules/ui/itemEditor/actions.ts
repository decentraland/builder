import { action } from 'typesafe-actions'

// Reset all third party item selections

export const RESET_THIRD_PARTY_ITEMS = 'Reset third party items'
export const resetThirdPartyItems = () => action(RESET_THIRD_PARTY_ITEMS)
export type ResetThirdPartyItems = ReturnType<typeof resetThirdPartyItems>

// Toggle third party item selection

export const TOGGLE_THIRD_PARTY_ITEM = 'Toggle third party item'
export const toggleThirdPartyItem = (itemId: string, isSelected: boolean) => action(TOGGLE_THIRD_PARTY_ITEM, { itemId, isSelected })
export type ToggleThirdPartyItemAction = ReturnType<typeof toggleThirdPartyItem>
