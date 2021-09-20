import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { BuilderAPI } from '../../lib/api/builder'
import { saveItemFailure, saveItemRequest, saveItemSuccess } from './actions'
import { itemSaga } from './sagas'
import { Item } from './types'
import { calculateFinalSize } from './export'
import { MAX_FILE_SIZE } from './utils'
import { call } from 'redux-saga/effects'

describe('when handling the save item request action', () => {
  let blob: Blob = new Blob()
  const contents: Record<string, Blob> = { path: blob }
  const builderAPI = ({
    saveItem: jest.fn()
  } as unknown) as BuilderAPI

  let dateNowSpy: jest.SpyInstance
  const updatedAt = Date.now()

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => updatedAt)
  })

  afterEach(() => {
    dateNowSpy.mockRestore()
  })

  it('should throw if name contains ":"', () => {
    const item = {
      name: 'invalid:name'
    } as Item
    return expectSaga(itemSaga, builderAPI)
      .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
      .dispatch(saveItemRequest(item, contents))
      .run({ silenceTimeout: true })
  })

  it('should throw if description contains ":"', () => {
    const item = {
      name: 'valid name',
      description: 'invalid:description'
    } as Item
    return expectSaga(itemSaga, builderAPI)
      .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
      .dispatch(saveItemRequest(item, contents))
      .run({ silenceTimeout: true })
  })

  it('should throw if description contains ":"', () => {
    const item = {
      name: 'valid name',
      description: 'invalid:description'
    } as Item
    return expectSaga(itemSaga, builderAPI)
      .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
      .dispatch(saveItemRequest(item, contents))
      .run({ silenceTimeout: true })
  })

  it('should throw if file size is larger than 2 MB', () => {
    const item = {
      name: 'valid name',
      description: 'valid description'
    } as Item
    return expectSaga(itemSaga, builderAPI)
      .provide([[matchers.call.fn(calculateFinalSize), Promise.resolve(MAX_FILE_SIZE + 1)]])
      .put(
        saveItemFailure(
          item,
          contents,
          'The entire item is too big to be uploaded. The max size for all files (including the thumbnail) is 2MB.'
        )
      )
      .dispatch(saveItemRequest(item, contents))
      .run({ silenceTimeout: true })
  })

  it('should save item and dispatch success action', () => {
    const item = {
      name: 'valid name',
      description: 'valid description',
      updatedAt
    } as Item

    return expectSaga(itemSaga, builderAPI)
      .provide([
        [matchers.call.fn(calculateFinalSize), Promise.resolve(1)],
        [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
      ])
      .put(saveItemSuccess(item, contents))
      .dispatch(saveItemRequest(item, contents))
      .run({ silenceTimeout: true })
  })

  it('should save item if it is already published', () => {
    const item = {
      name: 'valid name',
      description: 'valid description',
      updatedAt,
      isPublished: true
    } as Item
    return expectSaga(itemSaga, builderAPI)
      .provide([
        [matchers.call.fn(calculateFinalSize), Promise.resolve(1)],
        [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
      ])
      .put(saveItemSuccess(item, contents))
      .dispatch(saveItemRequest(item, contents))
      .run({ silenceTimeout: true })
  })
})
