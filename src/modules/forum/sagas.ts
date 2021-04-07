import { takeEvery, call, put } from 'redux-saga/effects'
import { builder } from 'lib/api/builder'
import {
  createCollectionForumPostFailure,
  CreateCollectionForumPostRequestAction,
  createCollectionForumPostSuccess,
  CREATE_COLLECTION_FORUM_POST_REQUEST
} from './actions'

export function* forumSaga() {
  yield takeEvery(CREATE_COLLECTION_FORUM_POST_REQUEST, handleCreateForumPostRequest)
}

function* handleCreateForumPostRequest(action: CreateCollectionForumPostRequestAction) {
  const { collection, forumPost } = action.payload
  try {
    const forumLink: string = yield call(() => builder.createCollectionForumPost(collection, forumPost))
    yield put(createCollectionForumPostSuccess(collection, forumLink))
  } catch (error) {
    yield put(createCollectionForumPostFailure(collection, error.message))
  }
}
