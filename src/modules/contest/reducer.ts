import { REGISTER_EMAIL, ACCEPT_TERMS, RegisterEmailAction, AcceptTermsAction } from './actions'

// projecs: { project id to timestamp }
export type ContestState = {
  email: string
  hasAcceptedTerms: boolean
  projects: { [projectId: string]: number }
}

const INITIAL_STATE: ContestState = {
  email: '',
  hasAcceptedTerms: false,
  projects: {}
}

export type ContestReducerAction = RegisterEmailAction | AcceptTermsAction

export const contestReducer = (state: ContestState = INITIAL_STATE, action: ContestReducerAction): ContestState => {
  switch (action.type) {
    case ACCEPT_TERMS: {
      return {
        ...state,
        hasAcceptedTerms: true
      }
    }
    case REGISTER_EMAIL: {
      const { email, projectId } = action.payload
      return {
        ...state,
        email,
        projects: { ...state.projects, [projectId]: Date.now() }
      }
    }
    default:
      return state
  }
}
