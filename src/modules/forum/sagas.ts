import { takeEvery, call, put } from 'redux-saga/effects'
import { builder } from 'lib/api/builder'
import {
  createCollectionForumPostFailure,
  CreateCollectionForumPostFailureAction,
  createCollectionForumPostRequest,
  CreateCollectionForumPostRequestAction,
  createCollectionForumPostSuccess,
  CREATE_COLLECTION_FORUM_POST_FAILURE,
  CREATE_COLLECTION_FORUM_POST_REQUEST
} from './actions'
import { delay } from 'dcl-catalyst-commons'

const RETRY_DELAY = '5000'

export function* forumSaga() {
  yield takeEvery(CREATE_COLLECTION_FORUM_POST_REQUEST, handleCreateForumPostRequest)
  yield takeEvery(CREATE_COLLECTION_FORUM_POST_FAILURE, handleCreateForumPostFailure)
}

function* handleCreateForumPostRequest(action: CreateCollectionForumPostRequestAction) {
  const { collection, forumPost } = action.payload
  try {
    console.log('Creating forum post request')
    const forumLink: string = yield call([builder, 'createCollectionForumPost'], collection, forumPost)
    yield put(createCollectionForumPostSuccess(collection, forumLink))
  } catch (error) {
    console.log('Failed forum post request', error)
    const forumPostAlreadyExists = error?.response?.status === 409
    const forumLink = error?.response?.data?.data?.forum_link
    if (forumPostAlreadyExists && forumLink) {
      console.log('It was a 409')
      yield put(createCollectionForumPostSuccess(collection, error?.response?.data?.data?.forum_link))
    }
    console.log('It wasnt a 409')
    yield put(createCollectionForumPostFailure(collection, forumPost, error.message))
  }
}

/**
 * Handles the post to forum request failures by re-launching the action to retry
 * the post undefinetly until it works.
 *
 * @param action - The failing action.
 */
function* handleCreateForumPostFailure(action: CreateCollectionForumPostFailureAction) {
  const { collection, forumPost } = action.payload
  console.log('Doing a retry')

  yield call(delay, RETRY_DELAY)
  yield put(createCollectionForumPostRequest(collection, forumPost))
}
