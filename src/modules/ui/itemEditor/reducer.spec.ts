import { resetThirdPartyItems, toggleThirdPartyItem } from './actions'
import { INITIAL_STATE, itemEditorReducer, ItemEditorState } from './reducer'

describe('when testing the item editor reducer', () => {
  let baseSelectedItemIds: string[]
  let itemId: string
  let state: ItemEditorState

  beforeEach(() => {
    baseSelectedItemIds = ['1', '2', '3']
    itemId = '5'
    state = {
      ...INITIAL_STATE,
      selectedThirdPartyItemIds: baseSelectedItemIds
    }
  })

  describe('when an action of type RESET_THIRD_PARTY_ITEMS is called', () => {
    it('should reset the selected third party ids back to an empty array', () => {
      expect(itemEditorReducer(state, resetThirdPartyItems())).toStrictEqual({
        ...INITIAL_STATE,
        selectedThirdPartyItemIds: []
      })
    })
  })

  describe('when an action of type TOGGLE_THIRD_PARTY_ITEM is called', () => {
    describe('when the third party item id is selected', () => {
      it('should add the third party item id to the selected item id list', () => {
        expect(itemEditorReducer(state, toggleThirdPartyItem(itemId, true))).toStrictEqual({
          ...INITIAL_STATE,
          selectedThirdPartyItemIds: [...baseSelectedItemIds, itemId]
        })
      })

      it('should add the third party item id only once avoiding duplicates', () => {
        const newState = itemEditorReducer(state, toggleThirdPartyItem(itemId, true))

        expect(itemEditorReducer(newState, toggleThirdPartyItem(itemId, true))).toStrictEqual({
          ...INITIAL_STATE,
          selectedThirdPartyItemIds: [...baseSelectedItemIds, itemId]
        })
      })
    })

    describe('when the third party item id is deselected', () => {
      beforeEach(() => {
        baseSelectedItemIds = ['1', '2', '3']

        state = {
          ...INITIAL_STATE,
          selectedThirdPartyItemIds: [...state.selectedThirdPartyItemIds, itemId]
        }
      })

      it('should remove the third party item id from the selected item id list', () => {
        expect(itemEditorReducer(state, toggleThirdPartyItem(itemId, false))).toStrictEqual({
          ...INITIAL_STATE,
          selectedThirdPartyItemIds: baseSelectedItemIds
        })
      })
    })
  })
})
