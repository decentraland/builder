import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { BuilderAPI } from 'lib/api/builder'
import {
  fetchCommitteeMembersRequest,
  fetchCommitteeMembersFailure,
  fetchCommitteeMembersSuccess,
  FETCH_COMMITTEE_MEMBERS_REQUEST
} from './action'
import { Account } from './types'

export function* committeeSaga(builder: BuilderAPI) {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_COMMITTEE_MEMBERS_REQUEST, handleFetchCommitteeMembersRequest)

  function* handleFetchCommitteeMembersRequest() {
    try {
      const committee: Account[] = yield call(() => builder.fetchCommittee())
      const members = committee.map(account => account.address)
      yield put(fetchCommitteeMembersSuccess(members))
    } catch (error) {
      yield put(fetchCommitteeMembersFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }
}

export function* handleConnectWallet() {
  yield put(fetchCommitteeMembersRequest())
}
