import { call, select } from '@redux-saga/core/effects'
import { getProfileOfAddress } from 'decentraland-dapps/dist/modules/profile/selectors'
import { Profile } from 'decentraland-dapps/dist/modules/profile/types'
import { BuilderAPI } from 'lib/api/builder'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { setCollectionCurationAssigneeSuccess } from 'modules/curations/collectionCuration/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import {
  createCollectionAssigneeForumPostRequest,
  createCollectionAssigneeForumPostFailure,
  createCollectionAssigneeForumPostSuccess,
  fetchCollectionForumPostReplySuccess,
  fetchCollectionForumPostReplyRequest,
  fetchCollectionForumPostReplyFailure
} from './actions'
import { forumSaga } from './sagas'
import { ForumPost, ForumPostReply } from './types'
import { buildCollectionNewAssigneePostBody } from './utils'

const FORUM_URL = 'https://forum.decentraland.org'

const mockErrorMessage = 'Some Error'

const mockBuilder = {
  createCollectionNewAssigneeForumPost: jest.fn(),
  getCollectionForumPostReply: jest.fn()
} as any as BuilderAPI

afterEach(() => {
  jest.clearAllMocks()
})

describe('when setting a new curation assignee successfully', () => {
  let mockedCuration: CollectionCuration
  let mockedCollection: Collection

  beforeEach(() => {
    mockedCollection = {
      id: 'anId',
      forumLink: `${FORUM_URL}/t/collection-cucos-created-by-MrCuco-is-ready-for-review/10713`
    } as Collection
    mockedCuration = {
      id: 'curationId',
      collectionId: mockedCollection.id,
      assignee: '0xaddress'
    } as CollectionCuration
  })

  it('should put the createCollectionAssigneeForumPostRequest action', () => {
    return expectSaga(forumSaga, mockBuilder)
      .provide([
        [select(getCollection, mockedCollection.id), mockedCollection],
        [select(getProfileOfAddress, mockedCuration.assignee!), null]
      ])
      .dispatch(setCollectionCurationAssigneeSuccess(mockedCollection.id, mockedCuration))
      .put(createCollectionAssigneeForumPostRequest(mockedCollection.id, mockedCuration))
      .run({ silenceTimeout: true })
  })
})

describe('when creating the new assignee forum post', () => {
  let mockedProfile: Profile
  let mockedCuration: CollectionCuration
  let mockedCollection: Collection
  let mockedForumPost: ForumPost

  beforeEach(() => {
    mockedCollection = {
      id: 'anId',
      forumLink: `${FORUM_URL}/t/collection-cucos-created-by-MrCuco-is-ready-for-review/10713`
    } as Collection
    mockedCuration = {
      id: 'curationId',
      collectionId: mockedCollection.id,
      assignee: '0xaddress'
    } as CollectionCuration
    mockedProfile = {
      avatars: [{ name: 'NandoKorea' }] as Profile['avatars']
    }
    mockedForumPost = {
      topic_id: parseInt(mockedCollection.forumLink!.split('/').pop()!, 10),
      raw: buildCollectionNewAssigneePostBody(mockedCuration.assignee, mockedProfile)
    }
  })

  describe('when the post creation fails', () => {
    it('should put the create collection assignee forum post fail action with an error', () => {
      return expectSaga(forumSaga, mockBuilder)
        .provide([
          [select(getCollection, mockedCollection.id), mockedCollection],
          [select(getProfileOfAddress, mockedCuration.assignee!), mockedProfile],
          [
            call([mockBuilder, mockBuilder.createCollectionNewAssigneeForumPost], mockedCollection, mockedForumPost),
            throwError(new Error(mockErrorMessage))
          ]
        ])
        .dispatch(createCollectionAssigneeForumPostRequest(mockedCollection.id, mockedCuration))
        .put(createCollectionAssigneeForumPostFailure(mockedCollection.id, mockedForumPost, mockErrorMessage))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the post creation succeeds', () => {
    it('should put create collection assignee forum post success action', () => {
      return expectSaga(forumSaga, mockBuilder)
        .provide([
          [select(getCollection, mockedCollection.id), mockedCollection],
          [select(getProfileOfAddress, mockedCuration.assignee!), mockedProfile],
          [call([mockBuilder, mockBuilder.createCollectionNewAssigneeForumPost], mockedCollection, mockedForumPost), {}]
        ])
        .dispatch(createCollectionAssigneeForumPostRequest(mockedCollection.id, mockedCuration))
        .put(createCollectionAssigneeForumPostSuccess())
        .run({ silenceTimeout: true })
    })
  })
})

describe('when fetching collection forum post reply', () => {
  let mockedCollection: Collection
  let topicId: string

  beforeEach(() => {
    topicId = '1234'
    mockedCollection = {
      id: 'anId',
      forumLink: `${FORUM_URL}/t/collection-cucos-created-by-MrCuco-is-ready-for-review/${topicId}`
    } as Collection
  })

  describe('and the collection has a valid forum link', () => {
    it('should put forum post reply success action', () => {
      const forumPostReply: ForumPostReply = {
        topic_id: topicId,
        highest_post_number: 1,
        show_read_indicator: true,
        last_read_post_number: 0
      }
      return expectSaga(forumSaga, mockBuilder)
        .provide([
          [select(getCollection, mockedCollection.id), mockedCollection],
          [call([mockBuilder, mockBuilder.getCollectionForumPostReply], topicId), forumPostReply]
        ])
        .dispatch(fetchCollectionForumPostReplyRequest(mockedCollection.id))
        .put(fetchCollectionForumPostReplySuccess(mockedCollection, forumPostReply))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the collection does not has a valid forum link', () => {
    beforeEach(() => {
      mockedCollection = {
        ...mockedCollection,
        forumLink: `${FORUM_URL}/t/collection-cucos-created-by-MrCuco-is-ready-for-review/`
      }
    })
    it('should put forum post reply failure action', () => {
      const error = `Invalid forum topic id for the collection id: ${mockedCollection.id}`
      return expectSaga(forumSaga, mockBuilder)
        .provide([[select(getCollection, mockedCollection.id), mockedCollection]])
        .dispatch(fetchCollectionForumPostReplyRequest(mockedCollection.id))
        .put(fetchCollectionForumPostReplyFailure(mockedCollection, error))
        .run({ silenceTimeout: true })
    })
  })
})
