import { call, select, takeEvery } from '@redux-saga/core/effects'
import { ToastType } from 'decentraland-ui'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { showToast } from 'decentraland-dapps/dist/modules/toast/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { BuilderAPI } from 'lib/api/builder'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { put } from 'redux-saga-test-plan/matchers'
import { CurationStatus } from '../types'
import {
  approveCollectionCurationFailure,
  ApproveCollectionCurationRequestAction,
  approveCollectionCurationSuccess,
  APPROVE_COLLECTION_CURATION_REQUEST,
  fetchCollectionCurationFailure,
  fetchCollectionCurationRequest,
  FetchCollectionCurationRequestAction,
  fetchCollectionCurationsFailure,
  fetchCollectionCurationsRequest,
  fetchCollectionCurationsSuccess,
  fetchCollectionCurationSuccess,
  FETCH_COLLECTION_CURATIONS_REQUEST,
  FETCH_COLLECTION_CURATION_REQUEST,
  pushCollectionCurationFailure,
  PushCollectionCurationRequestAction,
  pushCollectionCurationSuccess,
  PUSH_COLLECTION_CURATION_REQUEST,
  rejectCollectionCurationFailure,
  RejectCollectionCurationRequestAction,
  rejectCollectionCurationSuccess,
  REJECT_COLLECTION_CURATION_REQUEST,
  setCollectionCurationAssigneeFailure,
  SetCollectionCurationAssigneeRequestAction,
  setCollectionCurationAssigneeSuccess,
  SET_COLLECTION_CURATION_ASSIGNEE_REQUEST
} from './actions'
import { getSuccessfulAssignmentToastBody } from './toasts'
import { CollectionCuration } from './types'

export function* collectionCurationSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_COLLECTION_CURATIONS_REQUEST, handleFetchCurationsRequest)
  yield takeEvery(PUSH_COLLECTION_CURATION_REQUEST, handlePushCurationRequest)
  yield takeEvery(FETCH_COLLECTION_CURATION_REQUEST, handleFetchCurationRequest)
  yield takeEvery(APPROVE_COLLECTION_CURATION_REQUEST, handleApproveCurationRequest)
  yield takeEvery(REJECT_COLLECTION_CURATION_REQUEST, handleRejectCurationRequest)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeEvery(SET_COLLECTION_CURATION_ASSIGNEE_REQUEST, handleSetCurationCuratorAssigneeRequest)

  function* handleFetchCurationsRequest() {
    try {
      const curations: CollectionCuration[] = yield call([builder, builder.fetchCurations])
      yield put(fetchCollectionCurationsSuccess(curations))
    } catch (error) {
      yield put(fetchCollectionCurationsFailure(error.message))
    }
  }

  function* handleFetchCurationRequest(action: FetchCollectionCurationRequestAction) {
    try {
      const { collectionId } = action.payload
      const curation: CollectionCuration | undefined = yield call([builder, builder.fetchCuration], collectionId)
      yield put(fetchCollectionCurationSuccess(collectionId, curation))
    } catch (error) {
      yield put(fetchCollectionCurationFailure(error.message))
    }
  }

  function* handlePushCurationRequest(action: PushCollectionCurationRequestAction) {
    const { collectionId } = action.payload

    try {
      yield call([builder, builder.pushCuration], collectionId)
      yield put(pushCollectionCurationSuccess())
      yield put(fetchCollectionCurationRequest(collectionId))
    } catch (error) {
      yield put(pushCollectionCurationFailure(error.message))
    }
  }

  function* handleApproveCurationRequest(action: ApproveCollectionCurationRequestAction) {
    const { collectionId } = action.payload
    try {
      yield call([builder, 'updateCurationStatus'], collectionId, CurationStatus.APPROVED)
      yield put(approveCollectionCurationSuccess(collectionId))
    } catch (error) {
      yield put(approveCollectionCurationFailure(collectionId, error.message))
    }
  }

  function* handleRejectCurationRequest(action: RejectCollectionCurationRequestAction) {
    const { collectionId } = action.payload
    try {
      yield call([builder, 'updateCurationStatus'], collectionId, CurationStatus.REJECTED)
      yield put(rejectCollectionCurationSuccess(collectionId))
    } catch (error) {
      yield put(rejectCollectionCurationFailure(collectionId, error.message))
    }
  }

  function* handleConnectWalletSuccess() {
    yield put(fetchCollectionCurationsRequest())
  }

  function* handleSetCurationCuratorAssigneeRequest(action: SetCollectionCurationAssigneeRequestAction) {
    const { collectionId, assignee, curation } = action.payload
    const collection: Collection = yield select(getCollection, collectionId)
    const address: string | undefined = yield select(getAddress)
    try {
      let updatedCuration: CollectionCuration
      if (!curation) {
        updatedCuration = yield call([builder, builder.pushCuration], collectionId, assignee)
      } else {
        updatedCuration = yield call([builder, builder.updateCuration], collectionId, { assignee })
      }
      yield put(setCollectionCurationAssigneeSuccess(collectionId, updatedCuration))
      yield put(
        showToast({
          type: ToastType.INFO,
          title: assignee ? t('curation_page.assign_success_title') : t('curation_page.unassign_success_title'),
          body: getSuccessfulAssignmentToastBody(assignee, address, collection.name),
          timeout: 6000,
          closable: true
        })
      )
    } catch (error) {
      yield put(
        showToast({
          type: ToastType.ERROR,
          title: t('curation_page.error_message_title'),
          body: t('curation_page.error_message_body'),
          timeout: 6000,
          closable: true
        })
      )
      yield put(setCollectionCurationAssigneeFailure(collectionId, error.message))
    } finally {
      yield put(closeModal('EditCurationAssigneeModal'))
    }
  }
}
