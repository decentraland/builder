import { action } from 'typesafe-actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
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
export const createCollectionForumPostFailure = (collection: Collection, forumPost: ForumPost, error: string) =>
  action(CREATE_COLLECTION_FORUM_POST_FAILURE, { collection, forumPost, error })

export type CreateCollectionForumPostRequestAction = ReturnType<typeof createCollectionForumPostRequest>
export type CreateCollectionForumPostSuccessAction = ReturnType<typeof createCollectionForumPostSuccess>
export type CreateCollectionForumPostFailureAction = ReturnType<typeof createCollectionForumPostFailure>

// Create collection assignee event forum post

export const CREATE_COLLECTION_ASSIGNEE_FORUM_POST_REQUEST = '[Request] Create collection assignee forum post'
export const CREATE_COLLECTION_ASSIGNEE_FORUM_POST_SUCCESS = '[Success] Create collection assignee forum post'
export const CREATE_COLLECTION_ASSIGNEE_FORUM_POST_FAILURE = '[Failure] Create collection assignee forum post'

export const createCollectionAssigneeForumPostRequest = (collectionId: Collection['id'], curation: CollectionCuration) =>
  action(CREATE_COLLECTION_ASSIGNEE_FORUM_POST_REQUEST, { collectionId, curation })
export const createCollectionAssigneeForumPostSuccess = () => action(CREATE_COLLECTION_ASSIGNEE_FORUM_POST_SUCCESS)
export const createCollectionAssigneeForumPostFailure = (collectionId: Collection['id'], forumPost: ForumPost, error: string) =>
  action(CREATE_COLLECTION_ASSIGNEE_FORUM_POST_FAILURE, { collectionId, forumPost, error })

export type CreateCollectionAssigneeForumPostRequestAction = ReturnType<typeof createCollectionAssigneeForumPostRequest>
export type CreateCollectionAssigneeForumPostSuccessAction = ReturnType<typeof createCollectionAssigneeForumPostSuccess>
export type CreateCollectionAssigneeForumPostFailureAction = ReturnType<typeof createCollectionAssigneeForumPostFailure>
