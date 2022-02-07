import { LocalItem } from '@dcl/builder-client'
import {
  saveMultipleItemsRequest,
  SAVE_MULTIPLE_ITEMS_REQUEST,
  saveMultipleItemsFailure,
  saveMultipleItemsSuccess,
  saveMultipleItemsCancelled,
  SAVE_MULTIPLE_ITEMS_SUCCESS,
  SAVE_MULTIPLE_ITEMS_FAILURE,
  SAVE_MULTIPLE_ITEMS_CANCELLED,
  cancelSaveMultipleItems,
  SAVE_MULTIPLE_ITEMS_CANCEL,
  SAVE_MULTIPLE_ITEMS_CLEAR_STATE,
  clearStateSaveMultipleItems
} from './actions'
import { BuiltFile, Item } from './types'

let savedFiles: string[]
let savedItems: Item[]
let builtFiles: BuiltFile<Blob>[]

beforeEach(() => {
  savedFiles = ['aFile', 'anotherFile']
  builtFiles = [
    {
      item: {} as LocalItem,
      newContent: {
        content: new Blob()
      },
      fileName: 'someFileName.zip'
    }
  ]
})

describe('when creating the action to request the saving of multiple items', () => {
  it('should return an action signaling the request to save multiple items', () => {
    expect(saveMultipleItemsRequest(builtFiles)).toEqual({
      error: undefined,
      meta: undefined,
      type: SAVE_MULTIPLE_ITEMS_REQUEST,
      payload: {
        builtFiles
      }
    })
  })
})

describe('when creating the action to signal the success of saving multiple items', () => {
  it('should return an action signaling the success of saving multiple items', () => {
    expect(saveMultipleItemsSuccess(savedItems, savedFiles)).toEqual({
      error: undefined,
      meta: undefined,
      type: SAVE_MULTIPLE_ITEMS_SUCCESS,
      payload: {
        items: savedItems,
        fileNames: savedFiles
      }
    })
  })
})

describe('when creating the action to signal the failure of saving multiple items', () => {
  it('should return an action signaling the failure of saving multiple items', () => {
    expect(saveMultipleItemsFailure('someError', savedItems, savedFiles)).toEqual({
      error: undefined,
      meta: undefined,
      type: SAVE_MULTIPLE_ITEMS_FAILURE,
      payload: {
        error: 'someError',
        items: savedItems,
        fileNames: savedFiles
      }
    })
  })
})

describe('when creating the action to signal the cancellation of saving multiple items', () => {
  it('should return an action signaling the cancellation of saving multiple items', () => {
    expect(saveMultipleItemsCancelled(savedItems, savedFiles)).toEqual({
      error: undefined,
      meta: undefined,
      type: SAVE_MULTIPLE_ITEMS_CANCELLED,
      payload: {
        items: savedItems,
        fileNames: savedFiles
      }
    })
  })
})

describe('when creating the action to cancel the saving of multiple items', () => {
  it('should return an action to cancel the saving multiple items', () => {
    expect(cancelSaveMultipleItems()).toEqual({
      error: undefined,
      meta: undefined,
      type: SAVE_MULTIPLE_ITEMS_CANCEL,
      payload: undefined
    })
  })
})

describe('when creating the action to clear the saving multiple items state', () => {
  it('should return an action to clear the saving multiple items', () => {
    expect(clearStateSaveMultipleItems()).toEqual({
      error: undefined,
      meta: undefined,
      type: SAVE_MULTIPLE_ITEMS_CLEAR_STATE,
      payload: undefined
    })
  })
})
