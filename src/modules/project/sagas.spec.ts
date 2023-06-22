import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import { mockTemplate, mockTemplates } from 'specs/project'
import { loadTemplatesFailure, loadTemplatesRequest, loadTemplatesSuccess } from './actions'
import { projectSaga } from './sagas'

const builderAPI = {
  fetchTemplates: jest.fn()
} as unknown as BuilderAPI

describe('when handling the loadTemplatesRequest action', () => {
  describe('and the request is successful', () => {
    it('should put a loadTemplatesSuccess action with the project templates', () => {
      return expectSaga(projectSaga, builderAPI)
        .provide([[call([builderAPI, 'fetchTemplates']), Promise.resolve([mockTemplate])]])
        .put(loadTemplatesSuccess(mockTemplates))
        .dispatch(loadTemplatesRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('and the request fails', () => {
    it('should put a loadTemplatesFailure action with the error', () => {
      return expectSaga(projectSaga, builderAPI)
        .provide([[call([builderAPI, 'fetchTemplates']), Promise.reject(new Error('error'))]])
        .put(loadTemplatesFailure('error'))
        .dispatch(loadTemplatesRequest())
        .run({ silenceTimeout: true })
    })
  })
})
