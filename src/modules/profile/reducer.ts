import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { Profile } from 'modules/profile/types'
import {
  LoadProfileRequestAction,
  LoadProfileSuccessAction,
  LoadProfileFailureAction,
  LOAD_PROFILE_REQUEST,
  LOAD_PROFILE_SUCCESS,
  LOAD_PROFILE_FAILURE,
  CHANGE_PROFILE_REQUEST,
  CHANGE_PROFILE_SUCCESS,
  CHANGE_PROFILE_FAILURE,
  ChangeProfileRequestAction,
  ChangeProfileFailureAction,
  ChangeProfileSuccessAction
} from 'modules/profile/actions'

export type ProfileState = {
  data: Record<string, Profile>
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: ProfileState = {
  data: {},
  loading: [],
  error: {}
}

export type ProfileReducerAction =
  | LoadProfileRequestAction
  | LoadProfileSuccessAction
  | LoadProfileFailureAction
  | ChangeProfileFailureAction
  | ChangeProfileRequestAction
  | ChangeProfileSuccessAction

export const profileReducer = (state = INITIAL_STATE, action: ProfileReducerAction): ProfileState => {
  switch (action.type) {
    case LOAD_PROFILE_REQUEST:
    case LOAD_PROFILE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_PROFILE_SUCCESS: {
      const { address, profile } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [address]: profile
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case CHANGE_PROFILE_REQUEST:
    case CHANGE_PROFILE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case CHANGE_PROFILE_SUCCESS: {
      const { address, profile } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [address]: { ...state.data[address], ...profile }
        }
      }
    }
    default:
      return state
  }
}
