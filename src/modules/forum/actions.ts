import { action } from 'typesafe-actions'
import { Collection } from 'modules/collection/types'
import { ForumPost } from './types'

// Create collection forum post

export const CREATE_COLLECTION_FORUM_POST_REQUEST = '[Request] Create collection forum post'
export const CREATE_COLLECTION_FORUM_POST_SUCCESS = '[Success] Create collection forum post'
export const CREATE_COLLECTION_FORUM_POST_FAILURE = '[Failure] Create collection forum post'

export const createCollectionForumPostRequest = (collection: Collection, forumPost: ForumPost) =>
  action(CREATE_COLLECTION_FORUM_POST_REQUEST, { collection, forumPost })
export const createCollectionForumPostSuccess = (collection: Collection, forumLink: string) =>
  action(CREATE_COLLECTION_FORUM_POST_SUCCESS, {
    collection,
    forumLink
  })
export const createCollectionForumPostFailure = (collection: Collection, error: string) =>
  action(CREATE_COLLECTION_FORUM_POST_FAILURE, { collection, error })

export type CreateCollectionForumPostRequestAction = ReturnType<typeof createCollectionForumPostRequest>
export type CreateCollectionForumPostSuccessAction = ReturnType<typeof createCollectionForumPostSuccess>
export type CreateCollectionForumPostFailureAction = ReturnType<typeof createCollectionForumPostFailure>
