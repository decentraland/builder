import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  SUBMIT_PROJECT_REQUEST,
  ACCEPT_TERMS,
  SUBMIT_PROJECT_SUCCESS,
  SUBMIT_PROJECT_FAILURE,
  SubmitProjectRequestAction,
  AcceptTermsAction,
  SubmitProjectSuccessAction,
  SubmitProjectFailureAction
} from './actions'
import { Contest } from './types'

export type ContestState = {
  data: Contest
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: ContestState = {
  data: {
    email: '',
    ethAddress: '',
    hasAcceptedTerms: false,
    projects: {}
  },
  loading: [],
  error: null
}

export type ContestReducerAction = SubmitProjectRequestAction | SubmitProjectSuccessAction | SubmitProjectFailureAction | AcceptTermsAction

export const contestReducer = (state: ContestState = INITIAL_STATE, action: ContestReducerAction): ContestState => {
  switch (action.type) {
    case ACCEPT_TERMS: {
      return {
        ...state,
        data: {
          ...state.data,
          hasAcceptedTerms: true
        }
      }
    }
    case SUBMIT_PROJECT_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SUBMIT_PROJECT_SUCCESS: {
      const { projectId, contest } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...contest,
          projects: { ...state.data.projects, [projectId]: Date.now() }
        }
      }
    }
    case SUBMIT_PROJECT_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    default:
      return state
  }
}
