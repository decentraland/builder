import { createSelector } from 'reselect'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { FETCH_CANCELLED_ITEM_ORDERS_REQUEST } from './actions'
import { CancelledItemOrder, CancelledItemOrdersCollection } from './types'

export type CancelledItemOrdersGroup = {
  contractAddress: string
  collection: CancelledItemOrdersCollection | null
  count: number
}

export const getState = (state: RootState) => state.cancelledItemOrders
export const getCancelledItemOrders = (state: RootState) => getState(state).data
export const getCollectionsByContractAddress = (state: RootState) => getState(state).collectionsByContractAddress
export const getFetchedFor = (state: RootState) => getState(state).fetchedFor
export const getError = (state: RootState) => getState(state).error
// A page failed after others loaded: what is shown may be missing orders
export const isCancelledItemOrdersIncomplete = (state: RootState) => getError(state) !== null && getCancelledItemOrders(state).length > 0
export const isLoadingCancelledItemOrders = (state: RootState) =>
  isLoadingType(getState(state).loading, FETCH_CANCELLED_ITEM_ORDERS_REQUEST)

export const getCancelledItemOrdersByContractAddress = (
  state: RootState,
  contractAddress: string | null | undefined
): CancelledItemOrder[] => {
  if (!contractAddress) {
    return []
  }
  const normalized = contractAddress.toLowerCase()
  return getCancelledItemOrders(state).filter(order => order.asset.contractAddress.toLowerCase() === normalized)
}

export const getCancelledItemOrdersGroups = createSelector(
  [getCancelledItemOrders, getCollectionsByContractAddress],
  (orders, collectionsByContractAddress): CancelledItemOrdersGroup[] => {
    const groups = new Map<string, CancelledItemOrdersGroup>()
    for (const order of orders) {
      const contractAddress = order.asset.contractAddress.toLowerCase()
      const group = groups.get(contractAddress) ?? {
        contractAddress,
        collection: collectionsByContractAddress[contractAddress] ?? null,
        count: 0
      }
      group.count++
      groups.set(contractAddress, group)
    }
    // Largest first, so a truncated list shows the collections with most cancellations
    return Array.from(groups.values()).sort((a, b) => b.count - a.count)
  }
)
