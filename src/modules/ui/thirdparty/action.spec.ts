import { updateApprovalFlowProgress, APPROVAL_FLOW_UPDATE_PROGRESS } from './action'

describe('when creating the action to update the progress of the deploy of the multiple items to the catalyst', () => {
  it('should return an action signaling the update of the progress', () => {
    expect(updateApprovalFlowProgress(20)).toEqual({
      type: APPROVAL_FLOW_UPDATE_PROGRESS,
      payload: {
        progress: 20
      }
    })
  })
})
