import { SetUserIdAction, SetUserEmailAction, SET_USER_ID, SET_USER_EMAIL, SetUserProfileAction, SET_USER_PROFILE } from './actions'
import { User } from './types'

export type UserState = User

const INITIAL_STATE: UserState = {
  id: '',
  email: ''
}

export type UserReducerAction = SetUserEmailAction | SetUserIdAction | SetUserProfileAction

export const userReducer = (state = INITIAL_STATE, action: UserReducerAction): UserState => {
  switch (action.type) {
    case SET_USER_ID: {
      const { id } = action.payload
      return { ...state, id }
    }
    case SET_USER_EMAIL: {
      const { email } = action.payload
      return { ...state, email }
    }
    case SET_USER_PROFILE: {
      const { data } = action.payload
      return { ...state, ...data }
    }
    default:
      return state
  }
}
