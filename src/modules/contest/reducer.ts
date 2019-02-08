import { REGISTER_EMAIL, RegisterEmailAction } from './actions'

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

export type ContestReducerAction = RegisterEmailAction

export const contestReducer = (state: ContestState = INITIAL_STATE, action: ContestReducerAction): ContestState => {
  switch (action.type) {
    case REGISTER_EMAIL: {
      const { email, projectId } = action.payload
      return {
        email,
        hasAcceptedTerms: true,
        projects: { ...state.projects, [projectId]: Date.now() }
      }
    }
    default:
      return state
  }
}
