import { updateApprovalFlowProgress } from './action'
import { ThirdPartyReducer, INITIAL_STATE } from './reducer'

describe('when starting the reducer', () => {
  it('should return the initial state', () => {
    expect(ThirdPartyReducer(undefined, {} as any)).toEqual(INITIAL_STATE)
  })
})

describe('when reducing the action that updates the progress of the upload to the catalyst', () => {
  it('should return an state with the progress being updated', () => {
    expect(ThirdPartyReducer(INITIAL_STATE, updateApprovalFlowProgress(50))).toEqual({
      ...INITIAL_STATE,
      approvalFlowUpdateProgress: 50
    })
  })
})
