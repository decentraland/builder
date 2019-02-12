import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'
import { User } from './types'

export type UserState = User

const INITIAL_STATE: UserState = {
  email: ''
}

export type UserReducerAction = SubmitProjectSuccessAction

export const userReducer = (state = INITIAL_STATE, action: UserReducerAction): UserState => {
  switch (action.type) {
    case SUBMIT_PROJECT_SUCCESS: {
      const { contest } = action.payload
      return { email: contest.email }
    }
    default:
      return state
  }
}
