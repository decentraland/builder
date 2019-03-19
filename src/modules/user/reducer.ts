import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'
import { SetUserIdAction, SetUserEmailAction, SET_USER_ID, SET_USER_EMAIL } from './actions'
import { User } from './types'

export type UserState = User

const INITIAL_STATE: UserState = {
  id: '',
  email: ''
}

export type UserReducerAction = SubmitProjectSuccessAction | SetUserEmailAction | SetUserIdAction

export const userReducer = (state = INITIAL_STATE, action: UserReducerAction): UserState => {
  switch (action.type) {
    case SUBMIT_PROJECT_SUCCESS: {
      const { contest } = action.payload
      return { ...state, email: contest.email }
    }
    case SET_USER_ID: {
      const { id } = action.payload
      return { ...state, id }
    }
    case SET_USER_EMAIL: {
      const { email } = action.payload
      return { ...state, email }
    }
    default:
      return state
  }
}
