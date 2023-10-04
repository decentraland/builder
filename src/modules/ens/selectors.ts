import { createSelector } from 'reselect'
import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { AuthorizationStepStatus } from 'decentraland-ui'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isEqual } from 'lib/address'
import { RootState } from 'modules/common/types'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { getName } from 'modules/profile/selectors'
import {
  SET_ENS_RESOLVER_SUCCESS,
  SET_ENS_CONTENT_REQUEST,
  SET_ENS_CONTENT_SUCCESS,
  ALLOW_CLAIM_MANA_SUCCESS,
  RECLAIM_NAME_SUCCESS,
  CLAIM_NAME_REQUEST,
  CLAIM_NAME_TRANSACTION_SUBMITTED
} from './actions'
import { Authorization, ENS } from './types'
import { ENSState } from './reducer'
import { getDomainFromName } from './utils'

export const getState = (state: RootState) => state.ens
export const getData = (state: RootState) => getState(state).data
export const getExternalNames = (state: RootState) => getState(state).externalNames
export const getAuthorizations = (state: RootState) => getState(state).authorizations
export const getError = (state: RootState) => getState(state).error
export const getLoading = (state: RootState) => getState(state).loading

export const getENSList = createSelector<RootState, ENSState['data'], ENS[]>(getData, ensData => Object.values(ensData))

export const getENSByWallet = createSelector<RootState, ENS[], string | undefined, ENS[]>(getENSList, getAddress, (ensList, address = '') =>
  ensList.filter(ens => isEqual(ens.nftOwnerAddress, address))
)

export const getExternalNamesList = createSelector(getExternalNames, externalNames => {
  return Object.values(externalNames)
})

export const getExternalNamesForConnectedWallet = createSelector(getExternalNames, getAddress, (externalNames, address = '') => {
  return Object.values(externalNames).filter(externalName => isEqual(externalName.nftOwnerAddress, address))
})

export const getExternalNamesForWallet = (wallet: string) => (state: RootState) => {
  const externalNames = getExternalNames(state)
  return Object.values(externalNames).filter(externalName => isEqual(externalName.nftOwnerAddress, wallet))
}

export const getAuthorizationByWallet = createSelector<
  RootState,
  ENSState['authorizations'],
  string | undefined,
  Authorization | undefined
>(getAuthorizations, getAddress, (authorizations, address = '') => {
  for (const authAddress in authorizations) {
    if (isEqual(authAddress, address)) {
      return authorizations[authAddress]
    }
  }
  return undefined
})

export const getAliases = createSelector<RootState, ENS[], string | undefined, string | null, ENS[]>(
  getENSList,
  getAddress,
  getName,
  (ensList, address = '', name = '') =>
    ensList.filter(ens => isEqual(ens.nftOwnerAddress, address) && name && ens.subdomain === getDomainFromName(name))
)

export const getENSForLand = (state: RootState, landId: string) => {
  const ensList = getENSList(state)
  return ensList.filter(ens => ens.landId === landId)
}

export const getENSBySubdomain = (state: RootState, subdomain = '') => {
  const ensList = getENSList(state)
  return ensList.find(ens => ens.subdomain === subdomain) as ENS
}

export const isWaitingTxReclaim = createSelector<RootState, Transaction[], boolean>(getPendingTransactions, transactions =>
  transactions.some(transaction => RECLAIM_NAME_SUCCESS === transaction.actionType)
)

export const isWaitingTxClaimName = createSelector<RootState, Transaction[], boolean>(getPendingTransactions, transactions =>
  transactions.some(transaction => CLAIM_NAME_TRANSACTION_SUBMITTED === transaction.actionType)
)

export const isWaitingTxAllowMana = createSelector<RootState, Transaction[], boolean>(getPendingTransactions, transactions =>
  transactions.some(transaction => ALLOW_CLAIM_MANA_SUCCESS === transaction.actionType)
)

export const isWaitingTxSetResolver = createSelector<RootState, Transaction[], boolean>(getPendingTransactions, transactions =>
  transactions.some(transaction => SET_ENS_RESOLVER_SUCCESS === transaction.actionType)
)

export const isWaitingTxSetLandContent = (state: RootState, landId: string) =>
  getPendingTransactions(state).some(
    transaction => SET_ENS_CONTENT_SUCCESS === transaction.actionType && transaction.payload.land.id === landId
  )

export const isReclaimingName = (state: RootState, name: string) =>
  getLoading(state).some(loadingAction => loadingAction.type === CLAIM_NAME_REQUEST && loadingAction.name === name)

export const isLoadingContentBySubdomain = createSelector<RootState, ENS[], LoadingState, Record<string, boolean>>(
  getENSList,
  getLoading,
  (ensList, loading) =>
    ensList.reduce(
      (obj, ens) => ({
        ...obj,
        [ens.subdomain]: loading.some(action => action.type === SET_ENS_CONTENT_REQUEST && action.payload.ens.subdomain === ens.subdomain)
      }),
      {} as Record<string, boolean>
    )
)

export const isPendingContentBySubdomain = createSelector<RootState, ENS[], Transaction[], Record<string, boolean>>(
  getENSList,
  getPendingTransactions,
  (ensList, transactions) =>
    ensList.reduce(
      (obj, ens) => ({
        ...obj,
        [ens.subdomain]: transactions.some(
          transaction => SET_ENS_CONTENT_SUCCESS === transaction.actionType && transaction.payload.ens.subdomain === ens.subdomain
        )
      }),
      {} as Record<string, boolean>
    )
)

export const getClaimNameStatus = (state: RootState) => {
  if (isLoadingType(getLoading(state), CLAIM_NAME_REQUEST)) {
    return AuthorizationStepStatus.WAITING
  }

  if (isWaitingTxClaimName(state)) {
    return AuthorizationStepStatus.PROCESSING
  }

  if (getError(state)) {
    return AuthorizationStepStatus.ERROR
  }

  return AuthorizationStepStatus.PENDING
}

export const getErrorMessage = (state: RootState) => {
  const error = getError(state)
  if (error) {
    return error.message
  }

  return null
}
