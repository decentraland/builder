import { takeEvery, call, put, delay } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import { shorten } from '../../lib/address'
import {
  createCollectionForumPostFailure,
  CreateCollectionForumPostFailureAction,
  createCollectionForumPostRequest,
  CreateCollectionForumPostRequestAction,
  createCollectionForumPostSuccess,
  CREATE_COLLECTION_FORUM_POST_FAILURE,
  CREATE_COLLECTION_FORUM_POST_REQUEST
} from './actions'

const RETRY_DELAY = 5000

export function* forumSaga(builder: BuilderAPI) {
  yield takeEvery(CREATE_COLLECTION_FORUM_POST_REQUEST, handleCreateForumPostRequest)
  yield takeEvery(CREATE_COLLECTION_FORUM_POST_FAILURE, handleCreateForumPostFailure)

  function* handleCreateForumPostRequest(action: CreateCollectionForumPostRequestAction) {
    const { collection, forumPost } = action.payload
    try {
      const forumLink: string = yield call([builder, 'createCollectionForumPost'], collection, forumPost)
      yield put(createCollectionForumPostSuccess(collection, forumLink))
    } catch (error) {
      if (builder.isAxiosError(error) && error.response) {
        const forumPostAlreadyExists = error.response.status === 409
        const forumLink = error.response.data?.data?.forum_link

        if (forumPostAlreadyExists && forumLink) {
          yield put(createCollectionForumPostSuccess(collection, forumLink))
          return
        }

        const duplicatedTitle = error.response.status === 500 && error.response.data?.data?.errors?.includes('Title has already been used')

        if (duplicatedTitle) {
          yield put(
            createCollectionForumPostRequest(collection, {
              ...forumPost,
              title: `${forumPost.title} ${shorten(collection.contractAddress!)}`
            })
          )
          return
        }
      }

      yield put(createCollectionForumPostFailure(collection, forumPost, error.message))
    }
  }
}

/**
 * Handles the post to forum request failures by re-launching the action to retry
 * the post indefinitely until it works.
 *
 * @param action - The failing action.
 */
function* handleCreateForumPostFailure(action: CreateCollectionForumPostFailureAction) {
  const { collection, forumPost } = action.payload

  yield delay(RETRY_DELAY)
  yield put(createCollectionForumPostRequest(collection, forumPost))
}
