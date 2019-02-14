import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { CLOSE_MODAL, CloseModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

import { OPEN_EDITOR, OpenEditorAction } from 'modules/editor/actions'
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

export type ContestReducerAction =
  | OpenEditorAction
  | CloseModalAction
  | SubmitProjectRequestAction
  | SubmitProjectSuccessAction
  | SubmitProjectFailureAction
  | AcceptTermsAction

export const contestReducer = (state: ContestState = INITIAL_STATE, action: ContestReducerAction): ContestState => {
  switch (action.type) {
    case OPEN_EDITOR: {
      return { ...state, loading: [], error: null }
    }
    case CLOSE_MODAL: {
      const { name } = action.payload
      return name === 'AddToContestModal' ? { ...state, error: null } : state
    }
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
        error: null,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SUBMIT_PROJECT_SUCCESS: {
      const { projectId, contest } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
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
