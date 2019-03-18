import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'
import { SetEmailAction, SetSecretAction, SET_EMAIL, SET_SECRET } from './actions'
import { User } from './types'

export type UserState = User

const INITIAL_STATE: UserState = {
  email: '',
  secret: null
}

export type UserReducerAction = SubmitProjectSuccessAction | SetEmailAction | SetSecretAction

export const userReducer = (state = INITIAL_STATE, action: UserReducerAction): UserState => {
  switch (action.type) {
    case SUBMIT_PROJECT_SUCCESS: {
      const { contest } = action.payload
      return { ...state, email: contest.email }
    }
    case SET_EMAIL: {
      const { email } = action.payload
      return { ...state, email }
    }
    case SET_SECRET: {
      const { secret } = action.payload
      return { ...state, secret }
    }
    default:
      return state
  }
}
