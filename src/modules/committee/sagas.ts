import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { BuilderAPI } from 'lib/api/builder'
import { fetchCollectionsRequest } from 'modules/collection/actions'
import { fetchItemsRequest } from 'modules/item/actions'
import {
  fetchCommitteeMembersRequest,
  fetchCommitteeMembersFailure,
  fetchCommitteeMembersSuccess,
  FETCH_COMMITTEE_MEMBERS_REQUEST,
  FETCH_COMMITTEE_MEMBERS_SUCCESS
} from './action'
import { Account } from './types'
import { isWalletCommitteeMember } from './selectors'

export function* committeeSaga(builder: BuilderAPI) {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_COMMITTEE_MEMBERS_REQUEST, handleFetchCommitteeMembersRequest)
  yield takeEvery(FETCH_COMMITTEE_MEMBERS_SUCCESS, handleFetchCommitteeMembersSuccess)

  function* handleFetchCommitteeMembersRequest() {
    try {
      const committee: Account[] = yield call(() => builder.fetchCommittee())
      const members = committee.map(account => account.address)
      yield put(fetchCommitteeMembersSuccess(members))
    } catch (error) {
      yield put(fetchCommitteeMembersFailure(error.message))
    }
  }
}

function* handleFetchCommitteeMembersSuccess() {
  const isCommitteeMember: boolean = yield select(isWalletCommitteeMember)
  if (isCommitteeMember) {
    yield put(fetchCollectionsRequest())
    yield put(fetchItemsRequest())
  }
}

export function* handleConnectWallet() {
  yield put(fetchCommitteeMembersRequest())
}
