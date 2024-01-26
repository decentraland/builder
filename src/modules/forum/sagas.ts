import { takeEvery, call, put, delay, select } from 'redux-saga/effects'
import { getProfileOfAddress } from 'decentraland-dapps/dist/modules/profile/selectors'
import { Profile } from 'decentraland-dapps/dist/modules/profile/types'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { BuilderAPI } from 'lib/api/builder'
import {
  SetCollectionCurationAssigneeSuccessAction,
  SET_COLLECTION_CURATION_ASSIGNEE_SUCCESS
} from 'modules/curations/collectionCuration/actions'
import { Collection } from 'modules/collection/types'
import { getCollection } from 'modules/collection/selectors'
import { shorten } from '../../lib/address'
import { buildCollectionNewAssigneePostBody } from './utils'
import {
  createCollectionAssigneeForumPostFailure,
  createCollectionAssigneeForumPostRequest,
  CreateCollectionAssigneeForumPostRequestAction,
  createCollectionAssigneeForumPostSuccess,
  createCollectionForumPostFailure,
  CreateCollectionForumPostFailureAction,
  createCollectionForumPostRequest,
  CreateCollectionForumPostRequestAction,
  createCollectionForumPostSuccess,
  CREATE_COLLECTION_ASSIGNEE_FORUM_POST_REQUEST,
  CREATE_COLLECTION_FORUM_POST_FAILURE,
  CREATE_COLLECTION_FORUM_POST_REQUEST,
  fetchCollectionForumPostReplyFailure,
  FetchCollectionForumPostReplyRequestAction,
  fetchCollectionForumPostReplySuccess,
  FETCH_COLLECTION_FORUM_POST_REPLY_REQUEST
} from './actions'
import { ForumPostReply } from './types'

const RETRY_DELAY = 5000

export function* forumSaga(builder: BuilderAPI) {
  yield takeEvery(CREATE_COLLECTION_FORUM_POST_REQUEST, handleCreateForumPostRequest)
  yield takeEvery(CREATE_COLLECTION_FORUM_POST_FAILURE, handleCreateForumPostFailure)
  yield takeEvery(SET_COLLECTION_CURATION_ASSIGNEE_SUCCESS, handleSetAssigneeSuccess)
  yield takeEvery(CREATE_COLLECTION_ASSIGNEE_FORUM_POST_REQUEST, handleCreateCollectionAssigneeForumPost)
  yield takeEvery(FETCH_COLLECTION_FORUM_POST_REPLY_REQUEST, handleFetchCollectionForumPostReply)

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
              title: `${forumPost.title!} ${shorten(collection.contractAddress!)}`
            })
          )
          return
        }
      }

      yield put(createCollectionForumPostFailure(collection, forumPost, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleSetAssigneeSuccess(action: SetCollectionCurationAssigneeSuccessAction) {
    const { collectionId, curation } = action.payload
    yield put(createCollectionAssigneeForumPostRequest(collectionId, curation))
  }

  function* handleFetchCollectionForumPostReply(action: FetchCollectionForumPostReplyRequestAction) {
    const { collectionId } = action.payload
    const collection: Collection = yield select(getCollection, collectionId)
    const topicId = collection.forumLink ? collection.forumLink.split('/').pop() : null
    try {
      if (topicId) {
        const forumPostReply: ForumPostReply = yield call([builder, 'getCollectionForumPostReply'], topicId)
        yield put(fetchCollectionForumPostReplySuccess(collection, forumPostReply))
      } else {
        throw new Error(`Invalid forum topic id for the collection id: ${collectionId}`)
      }
    } catch (error) {
      yield put(fetchCollectionForumPostReplyFailure(collection, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleCreateCollectionAssigneeForumPost(action: CreateCollectionAssigneeForumPostRequestAction) {
    const { collectionId, curation } = action.payload
    const collection: Collection = yield select(getCollection, collectionId)
    const profile: Profile | null = curation.assignee ? yield select(getProfileOfAddress, curation.assignee) : null

    if (collection.forumLink) {
      const topicId = collection.forumLink.split('/').pop()
      const forumPost = {
        topic_id: parseInt(topicId!, 10),
        raw: buildCollectionNewAssigneePostBody(curation.assignee, profile)
      }
      try {
        yield call([builder, 'createCollectionNewAssigneeForumPost'], collection, forumPost)
        yield put(createCollectionAssigneeForumPostSuccess())
      } catch (error) {
        yield put(
          createCollectionAssigneeForumPostFailure(collectionId, forumPost, isErrorWithMessage(error) ? error.message : 'Unknown error')
        )
      }
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
