import { SAVE_MULTIPLE_ITEMS_UPDATE_PROGRESS, updateProgressSaveMultipleItems } from './action'

describe('when creating the action to update the progress of the save of the multiple items', () => {
  it('should return an action signaling the update of the progress', () => {
    expect(updateProgressSaveMultipleItems(20)).toEqual({
      type: SAVE_MULTIPLE_ITEMS_UPDATE_PROGRESS,
      payload: {
        progress: 20
      }
    })
  })
})
