import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { AuthIdentity } from '@dcl/crypto'
import { BuilderAPI } from 'lib/api/builder'
import { mockTemplate, mockTemplates } from 'specs/project'
import { loginSuccess } from 'modules/identity/actions'
import { loadProjectsRequest, loadTemplatesFailure, loadTemplatesRequest, loadTemplatesSuccess } from './actions'
import { projectSaga } from './sagas'

const builderAPI = {
  fetchTemplates: jest.fn()
} as unknown as BuilderAPI

// TODO: remove this after removing the SDK7_TEMPLATES feature flag
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

describe('when handling the loginSuccess action', () => {
  let wallet: Wallet
  let identity: AuthIdentity

  beforeEach(() => {
    wallet = { address: '0xa' } as Wallet
    identity = {} as AuthIdentity
  })

  describe('and the FF Templates is enabled', () => {
    it('should put a loadTemplatesRequest action', () => {
      return expectSaga(projectSaga, builderAPI)
        .put(loadTemplatesRequest())
        .put(loadProjectsRequest())
        .dispatch(loginSuccess(wallet, identity))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the FF Templates is disabled', () => {
    it('should not put a loadTemplatesRequest action', () => {
      return expectSaga(projectSaga, builderAPI)
        .put(loadProjectsRequest())
        .dispatch(loginSuccess(wallet, identity))
        .run({ silenceTimeout: true })
    })
  })
})
