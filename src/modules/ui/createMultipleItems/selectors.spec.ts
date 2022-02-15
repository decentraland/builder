import { RootState } from 'modules/common/types'
import { UIState } from '../reducer'
import { INITIAL_STATE, MultipleItemsSaveState } from './reducer'
import { getMultipleItemsSaveState, getProgress, getSavedItemsFiles } from './selectors'

let state: RootState

beforeEach(() => {
  state = {
    ui: {
      createMultipleItems: { ...INITIAL_STATE, progress: 50, savedItemsFiles: ['file1', 'file2'], state: MultipleItemsSaveState.UPLOADING }
    } as UIState
  } as RootState
})

describe('when getting the save progress', () => {
  it('should return the progress', () => {
    expect(getProgress(state)).toEqual(state.ui.createMultipleItems.progress)
  })
})

describe('when getting the saved files', () => {
  it('should return the saved files', () => {
    expect(getSavedItemsFiles(state)).toEqual(state.ui.createMultipleItems.savedItemsFiles)
  })
})

describe('when getting the multiple items save state', () => {
  it('should return the multiple items save state', () => {
    expect(getMultipleItemsSaveState(state)).toEqual(state.ui.createMultipleItems.state)
  })
})
