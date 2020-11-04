import { createSelector } from 'reselect'
import { getData } from 'decentraland-dapps/dist/modules/transaction/selectors'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isEqual } from 'lib/address'

export * from 'decentraland-dapps/dist/modules/transaction/selectors'

export const getTransactionsByType = (state: RootState, address: string, type: string): Transaction[] =>
  getData(state).filter(tx => isEqual(tx.from, address) && tx.actionType === type)

export const getTransactions = createSelector<RootState, Transaction[], string | undefined, Transaction[]>(
  getData,
  getAddress,
  (transactions, address) => transactions.filter(transaction => !!address && isEqual(transaction.from, address))
)
