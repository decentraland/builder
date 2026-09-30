import { expectSaga } from 'redux-saga-test-plan'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { AuthIdentity } from '@dcl/crypto'
import { BuilderAPI } from 'lib/api/builder'
import { loginSuccess } from 'modules/identity/actions'
import { syncSaga } from './sagas'

describe('when the user logs in with projects stored in the browser', () => {
  let builderAPI: BuilderAPI
  let wallet: Wallet
  let identity: AuthIdentity

  beforeEach(() => {
    builderAPI = {} as unknown as BuilderAPI
    wallet = { address: '0xa' } as Wallet
    identity = {} as AuthIdentity
  })

  it('should not queue any action to upload them to the builder server', async () => {
    const { effects } = await expectSaga(syncSaga, builderAPI).dispatch(loginSuccess(wallet, identity)).run({ silenceTimeout: true })

    expect(effects.put).toBeUndefined()
  })
})
