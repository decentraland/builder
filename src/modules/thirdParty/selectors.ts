import { createSelector } from 'reselect'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { Collection } from 'modules/collection/types'
import { getPendingTransactions, Transaction } from 'decentraland-dapps/dist/modules/transaction'
import { Item } from 'modules/item/types'
import { ThirdPartyState } from './reducer'
import { ThirdParty } from './types'
import {
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST,
  DISABLE_THIRD_PARTY_SUCCESS,
  FETCH_THIRD_PARTIES_REQUEST,
  DISABLE_THIRD_PARTY_REQUEST,
  FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST
} from './actions'
import { getThirdPartyForCollection, getThirdPartyForItem, isUserManagerOfThirdParty } from './utils'

export const getState = (state: RootState) => state.thirdParty
export const getData = (state: RootState) => getState(state).data
export const getItemSlotPrice = (state: RootState) => getState(state).itemSlotPrice
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getErrors = (state: RootState) => getState(state).errors

export const isThirdPartyManager = createSelector<RootState, ThirdPartyState['data'], string | undefined, boolean>(
  getData,
  getAddress,
  (thirdParties, address = '') => Object.values(thirdParties).some(thirdParty => isUserManagerOfThirdParty(address, thirdParty))
)

export const getWalletThirdParties = createSelector<RootState, ThirdPartyState['data'], string | undefined, ThirdParty[]>(
  getData,
  getAddress,
  (thirdParties, address = '') => Object.values(thirdParties).filter(thirdParty => thirdParty.managers.includes(address))
)

export const hasPendingDisableThirdPartyTransaction = (state: RootState, thirdPartyId: string): boolean => {
  const userAddress = getAddress(state)
  return (
    userAddress !== undefined &&
    getPendingTransactions(state, userAddress).some(
      (transaction: Transaction) =>
        [DISABLE_THIRD_PARTY_SUCCESS].includes(transaction.actionType) && transaction.payload.thirdPartyId === thirdPartyId
    )
  )
}

export const getThirdParty = (state: RootState, id: string): ThirdParty | null => getData(state)[id] ?? null

export const isDisablingThirdParty = (state: RootState): boolean => isLoadingType(getLoading(state), DISABLE_THIRD_PARTY_REQUEST)

export const getCollectionThirdParty = (state: RootState, collection: Collection): ThirdParty | null =>
  getThirdPartyForCollection(getData(state), collection) ?? null

export const getItemThirdParty = (state: RootState, item: Item): ThirdParty | null => getThirdPartyForItem(getData(state), item) ?? null

export const isLoadingThirdParties = (state: RootState): boolean => isLoadingType(getLoading(state), FETCH_THIRD_PARTIES_REQUEST)

export const isFetchingAvailableSlots = (state: RootState): boolean =>
  isLoadingType(getLoading(state), FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST)

export const isDeployingBatchedThirdPartyItems = (state: RootState): boolean =>
  isLoadingType(getLoading(state), DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST)
