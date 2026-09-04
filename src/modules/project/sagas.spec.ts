import { expectSaga } from 'redux-saga-test-plan'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { AuthIdentity } from '@dcl/crypto'
import { BuilderAPI } from 'lib/api/builder'
import { loginSuccess } from 'modules/identity/actions'
import { loadProjectsRequest } from './actions'
import { projectSaga } from './sagas'

const builderAPI = {} as unknown as BuilderAPI

describe('when handling the loginSuccess action', () => {
  let wallet: Wallet
  let identity: AuthIdentity

  beforeEach(() => {
    wallet = { address: '0xa' } as Wallet
    identity = {} as AuthIdentity
  })

  it('should put a loadProjectsRequest action', () => {
    return expectSaga(projectSaga, builderAPI)
      .put(loadProjectsRequest())
      .dispatch(loginSuccess(wallet, identity))
      .run({ silenceTimeout: true })
  })
})
