import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { builder } from 'lib/api/builder'
import {
  fetchCommitteeMembersRequest,
  fetchCommitteeMembersFailure,
  fetchCommitteeMembersSuccess,
  FETCH_COMMITTEE_MEMBERS_REQUEST
} from './action'
import { Account } from './types'

export function* committeeSaga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_COMMITTEE_MEMBERS_REQUEST, handleFetchCommitteeMembersMembersRequest)
}

export function* handleConnectWallet() {
  yield put(fetchCommitteeMembersRequest())
}

function* handleFetchCommitteeMembersMembersRequest() {
  try {
    const committee: Account[] = yield call(() => builder.getCommittee())
    const members = committee.map(account => account.address)
    yield put(fetchCommitteeMembersSuccess(members))
  } catch (error) {
    yield put(fetchCommitteeMembersFailure(error.message))
  }
}
