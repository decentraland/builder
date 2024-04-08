import { expectSaga } from 'redux-saga-test-plan'
import { call, put, select } from 'redux-saga/effects'
import { throwError } from 'redux-saga-test-plan/providers'
import { connectWalletSuccess } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { WorldsWalletStats, WorldsAPI } from 'lib/api/worlds'
import { fetchWorldsWalletStatsFailure, fetchWorldsWalletStatsRequest, fetchWorldsWalletStatsSuccess } from './actions'
import { worldsSaga } from './sagas'
import { clearDeploymentSuccess, deployToWorldSuccess } from 'modules/deployment/actions'
import { Deployment } from 'modules/deployment/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

let address: string
const MockWorldsAPI = WorldsAPI as jest.MockedClass<typeof WorldsAPI>
let worldsApi: WorldsAPI

beforeEach(() => {
  address = '0x123'
  worldsApi = new MockWorldsAPI()
})

describe('when handling the request action to fetch worlds stats for a wallet', () => {
  describe('when the worlds api request throws an error', () => {
    let error: Error

    beforeEach(() => {
      error = new Error('some error')
    })

    it('should put the failure action with the request action address and the error message', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call([worldsApi, worldsApi.fetchWalletStats], address), throwError(error)]])
        .put(fetchWorldsWalletStatsFailure(address, error.message))
        .dispatch(fetchWorldsWalletStatsRequest(address))
        .silentRun()
    })
  })

  describe('when the worlds api request returns null', () => {
    it('should put the failure action with the request action address and the error message', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call([worldsApi, worldsApi.fetchWalletStats], address), null]])
        .put(fetchWorldsWalletStatsFailure(address, 'Could not fetch wallet stats'))
        .dispatch(fetchWorldsWalletStatsRequest(address))
        .silentRun()
    })
  })

  describe('when the worlds api request returns the stats', () => {
    let stats: WorldsWalletStats

    beforeEach(() => {
      stats = {
        dclNames: [],
        ensNames: [],
        maxAllowedSpace: '',
        usedSpace: '',
        wallet: address
      }
    })

    it('should put the success action with the request action address and the stats', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call([worldsApi, worldsApi.fetchWalletStats], address), stats]])
        .put(fetchWorldsWalletStatsSuccess(address, stats))
        .dispatch(fetchWorldsWalletStatsRequest(address))
        .silentRun()
    })
  })
})

describe('when handling the connect wallet success action', () => {
  describe('when there is no address in the store', () => {
    it('should not put the request action to fetch worlds wallet stats', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[select(getAddress), undefined]])
        .not.put(fetchWorldsWalletStatsRequest(address))
        .dispatch(connectWalletSuccess({} as Wallet))
        .silentRun()
    })
  })

  describe('when there is an address in the store', () => {
    it('should put the request action to fetch worlds wallet stats with the stored address', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([
          [select(getAddress), address],
          [put(fetchWorldsWalletStatsRequest(address)), undefined]
        ])
        .put(fetchWorldsWalletStatsRequest(address))
        .dispatch(connectWalletSuccess({} as Wallet))
        .silentRun()
    })
  })
})

describe('when handling the deploy to world success action', () => {
  describe('when there is no address in the store', () => {
    it('should not put the request action to fetch worlds wallet stats', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[select(getAddress), undefined]])
        .not.put(fetchWorldsWalletStatsRequest(address))
        .dispatch(deployToWorldSuccess({} as Deployment))
        .silentRun()
    })
  })

  describe('when there is an address in the store', () => {
    it('should put the request action to fetch worlds wallet stats with the stored address', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([
          [select(getAddress), address],
          [put(fetchWorldsWalletStatsRequest(address)), undefined]
        ])
        .put(fetchWorldsWalletStatsRequest(address))
        .dispatch(deployToWorldSuccess({} as Deployment))
        .silentRun()
    })
  })
})

describe('when handling the clear deployment success action', () => {
  describe('when there is no address in the store', () => {
    it('should not put the request action to fetch worlds wallet stats', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[select(getAddress), undefined]])
        .not.put(fetchWorldsWalletStatsRequest(address))
        .dispatch(clearDeploymentSuccess(''))
        .silentRun()
    })
  })

  describe('when there is an address in the store', () => {
    it('should put the request action to fetch worlds wallet stats with the stored address', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([
          [select(getAddress), address],
          [put(fetchWorldsWalletStatsRequest(address)), undefined]
        ])
        .put(fetchWorldsWalletStatsRequest(address))
        .dispatch(clearDeploymentSuccess(''))
        .silentRun()
    })
  })
})
