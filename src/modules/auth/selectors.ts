/* tslint:disable */

import { createSelector } from 'reselect'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/common/types'
import { isTokenExpired } from './utils'
import { AuthState, User } from './types'
import { LEGACY_AUTH_REQUEST } from './actions'

export const getState = (state: RootState) => state.auth
export const getData = (state: RootState) => state.auth.data
export const getLoading = (state: RootState) => state.auth.loading
export const LEGACY_isLoggedIn = (state: RootState) => getData(state) !== null
export const LEGACY_isLoggingIn = (state: RootState) => isLoadingType(getLoading(state), LEGACY_AUTH_REQUEST)
export const getIdToken = createSelector<RootState, AuthState['data'], string | null>(getData, data => (data ? data.idToken : null))
export const getAccessToken = createSelector<RootState, AuthState['data'], string | null>(getData, data => (data ? data.accessToken : null))
export const isExpired = createSelector<RootState, AuthState['data'], boolean>(getData, data => !!data && isTokenExpired(data.expiresAt))
export const getEmail = createSelector<RootState, AuthState['data'], string | null>(getData, data => (data ? data.email : null))
export const getSub = createSelector<RootState, AuthState['data'], string | null>(getData, data => (data ? data.sub : null))

export const getUser = createSelector<RootState, AuthState['data'], User | null>(getData, data => (data && data.user ? data.user : null))

export const getName = createSelector<RootState, ReturnType<typeof getUser>, string | null>(getUser, user => (user ? user.name : null))

export const getFace = createSelector<RootState, ReturnType<typeof getUser>, string | null>(getUser, user =>
  user ? user.avatar.snapshots.face : null
)
