import { createSelector } from 'reselect'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isEqual } from 'lib/address'
import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { SET_ENS_RESOLVER_SUCCESS, SET_ENS_CONTENT_SUCCESS } from './actions'
import { ENS } from './types'
import { ENSState } from './reducer'

export const getState = (state: RootState) => state.ens
export const getData = (state: RootState) => getState(state).data
export const getError = (state: RootState) => getState(state).error
export const getLoading = (state: RootState) => getState(state).loading

export const getENSList = createSelector<RootState, ENSState['data'], ENS[]>(getData, ensData => Object.values(ensData))

export const getENSByWallet = createSelector<RootState, ENS[], string | undefined, ENS[]>(getENSList, getAddress, (ensList, address = '') =>
  ensList.filter(ens => isEqual(ens.address, address))
)

export const getENSForLand = (state: RootState, landId: string) => {
  const ensList = getENSList(state)
  console.log(landId)
  // return ensList.filter(ens => ens.landId === landId)
  return ensList
}

export const getIsWaitingTxSetResolver = (state: RootState) => {
  const address = getAddress(state)
  const result = address
    ? getPendingTransactions(state, address).some(
        transaction => SET_ENS_RESOLVER_SUCCESS === transaction.actionType && isPending(transaction.status) && transaction.payload.land
      )
    : false
  return result
}

export const getIsWaitingTxSetContent = (state: RootState, landId: string) => {
  const address = getAddress(state)
  const result = address
    ? getPendingTransactions(state, address).some(
        transaction =>
          SET_ENS_CONTENT_SUCCESS === transaction.actionType && isPending(transaction.status) && transaction.payload.land.id === landId
      )
    : false
  return result
}
