import { Transaction, TransactionStatus } from 'decentraland-dapps/dist/modules/transaction/types'
import { RootState } from 'modules/common/types'

export function addTransactionToState(state: RootState, action: string, status: TransactionStatus, address: string): RootState {
  const defaultTransactionState = { data: [], loading: false, error: null }

  return {
    ...state,
    transaction: {
      ...(state.transaction ?? defaultTransactionState),
      data: [...(state.transaction ?? defaultTransactionState).data, { status, from: address, actionType: action } as Transaction]
    }
  }
}
