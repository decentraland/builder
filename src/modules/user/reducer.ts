import { SetUserIdAction, SetUserEmailAction, SET_USER_ID, SET_USER_EMAIL, SET_ETH_ADDRESS, SetEthereumAddressAction } from './actions'
import { User } from './types'

export type UserState = User

const INITIAL_STATE: UserState = {
  id: '',
  email: '',
  ethAddress: ''
}

export type UserReducerAction = SetUserEmailAction | SetUserIdAction | SetEthereumAddressAction

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
    case SET_ETH_ADDRESS: {
      const { ethAddress } = action.payload
      return { ...state, ethAddress }
    }
    default:
      return state
  }
}
