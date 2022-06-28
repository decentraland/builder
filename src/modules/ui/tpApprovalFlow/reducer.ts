import { APPROVAL_FLOW_UPDATE_PROGRESS, UpdateApporvalFlowProgressAction } from './action'

export type TPApprovalFlowState = {
  progress: number
}

export const INITIAL_STATE: TPApprovalFlowState = {
  progress: 0
}

type TPApprovalFlowReducerAction = UpdateApporvalFlowProgressAction

export const TPApprovalFlowReducer = (state = INITIAL_STATE, action: TPApprovalFlowReducerAction): TPApprovalFlowState => {
  switch (action.type) {
    case APPROVAL_FLOW_UPDATE_PROGRESS: {
      const { progress } = action.payload

      return {
        ...state,
        progress
      }
    }
    default:
      return state
  }
}
