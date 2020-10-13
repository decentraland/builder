import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { SET_ENS_RESOLVER_SUCCESS, SET_ENS_CONTENT_SUCCESS } from './actions'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export const getState = (state: RootState) => state.ens
export const getError = (state: RootState) => getState(state).error
export const getSubdomainList = (state: RootState) => getState(state).subdomainList
export const getLoading = (state: RootState) => getState(state).loading
export const getWaitingTxSetResolver = (state: RootState) => {
  const address = getAddress(state)
  const result = address
    ? getPendingTransactions(state, address).some(
        transaction => SET_ENS_RESOLVER_SUCCESS === transaction.actionType && isPending(transaction.status)
      )
    : false
  return result
}
export const getWaitingTxSetContent = (state: RootState) => {
  const address = getAddress(state)
  const result = address
    ? getPendingTransactions(state, address).some(
        transaction => SET_ENS_CONTENT_SUCCESS === transaction.actionType && isPending(transaction.status)
      )
    : false
  return result
}
