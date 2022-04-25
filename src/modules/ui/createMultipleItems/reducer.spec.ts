import {
  clearSaveMultipleItems,
  saveMultipleItemsCancelled,
  saveMultipleItemsRequest,
  saveMultipleItemsSuccess
} from 'modules/item/actions'
import { updateProgressSaveMultipleItems } from './action'
import { createMultipleItemsReducer, INITIAL_STATE, MultipleItemsSaveState } from './reducer'

describe('when starting the reducer', () => {
  it('should return the initial state', () => {
    expect(createMultipleItemsReducer(undefined, {} as any)).toEqual(INITIAL_STATE)
  })
})

describe('when reducing the action to clear the state', () => {
  it('should return the initial state', () => {
    expect(
      createMultipleItemsReducer(
        {
          state: MultipleItemsSaveState.UPLOADING,
          progress: 50,
          savedItemsFiles: ['file1', 'file2'],
          cancelledItemFiles: ['file3'],
          notSavedItemsFiles: ['file4', 'file5']
        },
        clearSaveMultipleItems()
      )
    ).toEqual(INITIAL_STATE)
  })
})

describe('when reducing the action to request the start of the multiple items save', () => {
  it('should change the state to being uploading', () => {
    expect(createMultipleItemsReducer(INITIAL_STATE, saveMultipleItemsRequest([]))).toEqual({
      ...INITIAL_STATE,
      state: MultipleItemsSaveState.UPLOADING
    })
  })
})

describe('when reducing the action that signal the cancelling of the multiple items save', () => {
  it('should change the state to cancelled and store the file names of the saved items', () => {
    expect(createMultipleItemsReducer(INITIAL_STATE, saveMultipleItemsCancelled([], ['file1', 'file2'], [], ['file3', 'file4']))).toEqual({
      ...INITIAL_STATE,
      state: MultipleItemsSaveState.CANCELLED,
      savedItemsFiles: ['file1', 'file2'],
      cancelledItemFiles: ['file3', 'file4']
    })
  })
})

describe('when reducing the action that signals the successful multiple items save', () => {
  it('should change the state to finished successfully and store the file names of the saved items', () => {
    expect(createMultipleItemsReducer(INITIAL_STATE, saveMultipleItemsSuccess([], ['file1', 'file2'], []))).toEqual({
      ...INITIAL_STATE,
      state: MultipleItemsSaveState.FINISHED_SUCCESSFULLY,
      savedItemsFiles: ['file1', 'file2']
    })
  })
})

describe('when reducing the action that signal the successfull multiple multiple items save but some failed', () => {
  it('should change the state to finished unsuccessfully and store the file names of the saved items', () => {
    expect(createMultipleItemsReducer(INITIAL_STATE, saveMultipleItemsSuccess([], [], ['file1', 'file2']))).toEqual({
      ...INITIAL_STATE,
      state: MultipleItemsSaveState.FINISHED_SUCCESSFULLY,
      notSavedItemsFiles: ['file1', 'file2']
    })
  })
})

describe('when reducing the action that updates the progress of the multiple items save', () => {
  it('should return an state with the progress being updated', () => {
    expect(createMultipleItemsReducer(INITIAL_STATE, updateProgressSaveMultipleItems(50))).toEqual({
      ...INITIAL_STATE,
      progress: 50
    })
  })
})
