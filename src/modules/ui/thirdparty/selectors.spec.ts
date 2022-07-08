import { RootState } from 'modules/common/types'
import { UIState } from '../reducer'
import { INITIAL_STATE } from './reducer'
import { getApporvalFlowUpdateProgress } from './selectors'

let state: RootState

beforeEach(() => {
  state = {
    ui: {
      thirdParty: { ...INITIAL_STATE, approvalFlowUpdateProgress: 50 }
    } as UIState
  } as RootState
})

describe('when getting the upload progress', () => {
  it('should return the progress', () => {
    expect(getApporvalFlowUpdateProgress(state)).toEqual(state.ui.thirdParty.approvalFlowUpdateProgress)
  })
})
