import { updateApprovalFlowProgress } from './action'
import { TPApprovalFlowReducer, INITIAL_STATE } from './reducer'

describe('when starting the reducer', () => {
  it('should return the initial state', () => {
    expect(TPApprovalFlowReducer(undefined, {} as any)).toEqual(INITIAL_STATE)
  })
})

describe('when reducing the action that updates the progress of the upload to the catalyst', () => {
  it('should return an state with the progress being updated', () => {
    expect(TPApprovalFlowReducer(INITIAL_STATE, updateApprovalFlowProgress(50))).toEqual({
      ...INITIAL_STATE,
      progress: 50
    })
  })
})
