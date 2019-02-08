import { RegisterEmailAction, REGISTER_EMAIL } from 'modules/contest/actions'
import { User } from './types'

export type UserState = User

const INITIAL_STATE: UserState = {
  email: ''
}

export type UserReducerAction = RegisterEmailAction

export const userReducer = (state = INITIAL_STATE, action: UserReducerAction): UserState => {
  switch (action.type) {
    case REGISTER_EMAIL: {
      const { email } = action.payload
      return { email }
    }
    default:
      return state
  }
}
