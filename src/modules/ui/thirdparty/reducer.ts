import { THIRD_PARTY_ACTION_UPDATE_PROGRESS, UpdateThirdPartyProgressAction } from './action'
import { ThirdPartyAction } from './types'

export type ThirdPartyState = {
  progress: Record<ThirdPartyAction, number>
}

export const INITIAL_STATE: ThirdPartyState = {
  progress: {
    [ThirdPartyAction.APPROVE_COLLECTION]: 0,
    [ThirdPartyAction.PUSH_CHANGES]: 0
  }
}

type ThirdPartyReducerAction = UpdateThirdPartyProgressAction

export const ThirdPartyReducer = (state = INITIAL_STATE, action: ThirdPartyReducerAction): ThirdPartyState => {
  switch (action.type) {
    case THIRD_PARTY_ACTION_UPDATE_PROGRESS: {
      const { progress, action: thirdPartyAction } = action.payload

      return {
        ...state,
        progress: {
          ...state.progress,
          [thirdPartyAction]: progress
        }
      }
    }
    default:
      return state
  }
}
