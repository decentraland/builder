import { RootState } from 'modules/common/types'
import { UIState } from '../reducer'
import { INITIAL_STATE } from './reducer'
import { getProgress } from './selectors'

let state: RootState

beforeEach(() => {
  state = {
    ui: {
      tpApprovalFlow: { ...INITIAL_STATE, progress: 50 }
    } as UIState
  } as RootState
})

describe('when getting the upload progress', () => {
  it('should return the progress', () => {
    expect(getProgress(state)).toEqual(state.ui.tpApprovalFlow.progress)
  })
})
