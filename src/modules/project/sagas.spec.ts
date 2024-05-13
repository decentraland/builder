import { expectSaga } from 'redux-saga-test-plan'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { AuthIdentity } from '@dcl/crypto'
import { BuilderAPI } from 'lib/api/builder'
import { loginSuccess } from 'modules/identity/actions'
import { loadProjectsRequest, loadTemplatesRequest } from './actions'
import { projectSaga } from './sagas'

const builderAPI = {
  fetchTemplates: jest.fn()
} as unknown as BuilderAPI

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
