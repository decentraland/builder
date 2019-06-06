import { RootState } from 'modules/common/types'
import { UserState } from './reducer'
import { User } from './types'

export const getState: (state: RootState) => UserState = state => state.user

export const getId: (state: RootState) => User['id'] = state => getState(state).id

export const getEmail: (state: RootState) => User['email'] = state => getState(state).email
