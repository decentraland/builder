import { APPROVAL_FLOW_UPDATE_PROGRESS, UpdateApporvalFlowProgressAction } from './action'

export type ThirdPartyState = {
  approvalFlowUpdateProgress: number
}

export const INITIAL_STATE: ThirdPartyState = {
  approvalFlowUpdateProgress: 0
}

type ThirdPartyReducerAction = UpdateApporvalFlowProgressAction

export const ThirdPartyReducer = (state = INITIAL_STATE, action: ThirdPartyReducerAction): ThirdPartyState => {
  switch (action.type) {
    case APPROVAL_FLOW_UPDATE_PROGRESS: {
      const { progress } = action.payload

      return {
        ...state,
        approvalFlowUpdateProgress: progress
      }
    }
    default:
      return state
  }
}
