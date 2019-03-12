import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'
import { SetEmailAction, SET_EMAIL } from './actions'
import { User } from './types'

export type UserState = User

const INITIAL_STATE: UserState = {
  email: ''
}

export type UserReducerAction = SubmitProjectSuccessAction | SetEmailAction

export const userReducer = (state = INITIAL_STATE, action: UserReducerAction): UserState => {
  switch (action.type) {
    case SUBMIT_PROJECT_SUCCESS: {
      const { contest } = action.payload
      return { email: contest.email }
    }
    case SET_EMAIL: {
      const { email } = action.payload
      return { email }
    }
    default:
      return state
  }
}
