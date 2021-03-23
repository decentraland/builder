import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchCommitteeMembersFailureAction,
  FetchCommitteeMembersRequestAction,
  FetchCommitteeMembersSuccessAction,
  FETCH_COMMITTEE_MEMBERS_FAILURE,
  FETCH_COMMITTEE_MEMBERS_REQUEST,
  FETCH_COMMITTEE_MEMBERS_SUCCESS
} from './action'

export type CommitteeState = {
  data: {
    members: string[]
  }
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: CommitteeState = {
  data: { members: [] },
  loading: [],
  error: null
}

type CommitteeReducerAction = FetchCommitteeMembersRequestAction | FetchCommitteeMembersFailureAction | FetchCommitteeMembersSuccessAction

export function committeeReducer(state = INITIAL_STATE, action: CommitteeReducerAction): CommitteeState {
  switch (action.type) {
    case FETCH_COMMITTEE_MEMBERS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_COMMITTEE_MEMBERS_SUCCESS: {
      const { members } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: { ...state.data, members: [...members] }
      }
    }
    case FETCH_COMMITTEE_MEMBERS_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }

    default:
      return state
  }
}
