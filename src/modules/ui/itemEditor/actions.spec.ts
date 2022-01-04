import { resetThirdPartyItems, RESET_THIRD_PARTY_ITEMS, toggleThirdPartyItem, TOGGLE_THIRD_PARTY_ITEM } from './actions'

describe('when creating the action resets the selected third party items', () => {
  it('should return an action signaling the reset', () => {
    expect(resetThirdPartyItems()).toEqual({ type: RESET_THIRD_PARTY_ITEMS })
  })
})

describe('when creating the action that toggles a third party item selection', () => {
  let itemId = '2'
  let isSelected = true

  it('should return an action with the item and selection choice', () => {
    expect(toggleThirdPartyItem(itemId, isSelected)).toEqual({
      type: TOGGLE_THIRD_PARTY_ITEM,
      payload: { itemId, isSelected }
    })
  })
})
