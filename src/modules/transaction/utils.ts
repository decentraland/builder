import { race, take } from 'redux-saga/effects'
import {
  FetchTransactionSuccessAction,
  FetchTransactionFailureAction,
  FETCH_TRANSACTION_SUCCESS,
  FETCH_TRANSACTION_FAILURE
} from 'decentraland-dapps/dist/modules/transaction/actions'

// TODO: Move to a lib like decentraland-dapps
// Function that blocks the execution and waits until a tx is mined or it fails
export function* waitForTx(txHash: string) {
  while (true) {
    const {
      success,
      failure
    }: { success: FetchTransactionSuccessAction | undefined; failure: FetchTransactionFailureAction | undefined } = yield race({
      success: take(FETCH_TRANSACTION_SUCCESS),
      failure: take(FETCH_TRANSACTION_FAILURE)
    })

    if (success?.payload.transaction.hash === txHash) {
      break
    } else if (failure?.payload.transaction.hash === txHash) {
      throw new Error(`The transaction ${txHash} failed to be mined.`)
    }
  }
}
