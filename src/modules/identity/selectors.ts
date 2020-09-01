import { createSelector } from 'reselect'
import { AuthIdentity } from 'dcl-crypto'
import { isConnecting, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isValid } from './utils'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { GENERATE_IDENTITY_REQUEST } from './actions'

export const getState = (state: RootState) => state.identity
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getCurrentIdentity = createSelector<RootState, Record<string, AuthIdentity>, string | undefined, AuthIdentity | null>(
  getData,
  getAddress,
  (identities, address) => {
    if (address) {
      const identity = identities[address]
      if (isValid(identity)) {
        return identity
      }
    }
    return null
  }
)

export const isLoggedIn = (state: RootState) => getCurrentIdentity(state) !== null
export const isLoggingIn = (state: RootState) => isConnecting(state) || isLoadingType(getLoading(state), GENERATE_IDENTITY_REQUEST)
