import { ResetThirdPartyItems, RESET_THIRD_PARTY_ITEMS, ToggleThirdPartyItemAction, TOGGLE_THIRD_PARTY_ITEM } from './actions'

export type ItemEditorState = {
  selectedThirdPartyItemIds: string[]
}

export const INITIAL_STATE: ItemEditorState = {
  selectedThirdPartyItemIds: []
}

type ItemEditorReducerAction = ResetThirdPartyItems | ToggleThirdPartyItemAction

export const itemEditorReducer = (state = INITIAL_STATE, action: ItemEditorReducerAction): ItemEditorState => {
  switch (action.type) {
    case RESET_THIRD_PARTY_ITEMS: {
      return {
        ...state,
        selectedThirdPartyItemIds: []
      }
    }
    case TOGGLE_THIRD_PARTY_ITEM: {
      const { itemId, isSelected } = action.payload
      let selectedThirdPartyItemIds = []

      if (isSelected) {
        const selectedThirdPartyItemsSet = new Set([...state.selectedThirdPartyItemIds, itemId])
        selectedThirdPartyItemIds = Array.from(selectedThirdPartyItemsSet)
      } else {
        selectedThirdPartyItemIds = state.selectedThirdPartyItemIds.filter(stateItemId => stateItemId !== itemId)
      }

      return {
        ...state,
        selectedThirdPartyItemIds
      }
    }
    default:
      return state
  }
}
