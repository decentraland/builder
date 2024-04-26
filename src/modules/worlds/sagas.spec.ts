import { expectSaga } from 'redux-saga-test-plan'
import { call, put, select } from 'redux-saga/effects'
import { throwError } from 'redux-saga-test-plan/providers'
import { connectWalletSuccess } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { WorldsWalletStats, WorldsAPI, WorldPermissions, WorldPermissionType, WorldPermissionNames } from 'lib/api/worlds'
import {
  fetchWorldsWalletStatsFailure,
  fetchWorldsWalletStatsRequest,
  fetchWorldsWalletStatsSuccess,
  getWorldPermissionsFailure,
  getWorldPermissionsRequest,
  getWorldPermissionsSuccess,
  postWorldPermissionsFailure,
  postWorldPermissionsRequest,
  postWorldPermissionsSuccess,
  putWorldPermissionsFailure,
  putWorldPermissionsRequest,
  putWorldPermissionsSuccess
} from './actions'
import { worldsSaga } from './sagas'
import { clearDeploymentSuccess, deployToWorldSuccess } from 'modules/deployment/actions'
import { Deployment } from 'modules/deployment/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { loadProfileRequest, loadProfilesRequest } from 'decentraland-dapps/dist/modules/profile/actions'
import { Authorization } from 'lib/api/auth'

let address: string
const MockWorldsAPI = WorldsAPI as jest.MockedClass<typeof WorldsAPI>
let worldsApi: WorldsAPI

class AuthMock extends Authorization {
  constructor() {
    super(() => 'mockAddress')
  }
  createAuthHeaders = jest.fn().mockReturnValue({})
}

const worldPermissionsMock: WorldPermissions = {
  access: {
    type: WorldPermissionType.Unrestricted
  },
  deployment: {
    type: WorldPermissionType.AllowList,
    wallets: []
  },
  streaming: {
    type: WorldPermissionType.AllowList,
    wallets: []
  }
}

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

describe('when handling the request of permissions of a world', () => {
  const worldName = 'some-world.dcl.eth'
  describe('when there is an error with the fetch', () => {
    let error: Error

    beforeEach(() => {
      error = new Error('Could not fetch world permissions')
    })

    it('should put the failure action with the request action world name and the error message', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call(worldsApi.getPermissions, worldName), null], throwError(error)])
        .put(getWorldPermissionsFailure(worldName, error.message))
        .dispatch(getWorldPermissionsRequest(worldName))
        .silentRun()
    })
  })

  describe('when the permission fetch is successful and there aren`t any wallets in the permissions', () => {
    it('should put the success action with the retrieved permissions', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call(worldsApi.getPermissions, worldName), worldPermissionsMock]])
        .put(getWorldPermissionsSuccess(worldName, worldPermissionsMock))
        .dispatch(getWorldPermissionsRequest(worldName))
        .silentRun()
    })
  })

  describe('when the permission fetch is successful and there are wallets in the permissions', () => {
    let worldPermissionsMockTemp: WorldPermissions
    beforeEach(() => {
      worldPermissionsMockTemp = {
        ...worldPermissionsMock,
        deployment: {
          type: WorldPermissionType.AllowList,
          wallets: ['0x123']
        }
      }
    })

    it('should put the success action with the retrieved permissions and the load profile request for each wallet address', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call(worldsApi.getPermissions, worldName), worldPermissionsMockTemp]])
        .put(loadProfilesRequest(['0x123']))
        .put(getWorldPermissionsSuccess(worldName, worldPermissionsMockTemp))
        .dispatch(getWorldPermissionsRequest(worldName))
        .silentRun()
    })
  })
})

describe('when handling the request of changing permissions type of a world', () => {
  const worldName = 'some-world.dcl.eth'
  const worldPermissionNames = WorldPermissionNames.Access
  const worldPermissionType = WorldPermissionType.AllowList

  beforeEach(() => {
    worldsApi = new MockWorldsAPI(new AuthMock())
  })

  describe('when there is an error with the fetch', () => {
    let error: Error

    beforeEach(() => {
      error = new Error(`Couldn't update permission type`)
    })

    it('should put the failure action with the request action and the error message', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call(worldsApi.postPermissionType, worldName, worldPermissionNames, worldPermissionType), Promise.resolve(null)]])
        .put(postWorldPermissionsFailure(error.message))
        .dispatch(postWorldPermissionsRequest(worldName, worldPermissionNames, worldPermissionType))
        .silentRun()
    })
  })

  describe('when the permission fetch is successful', () => {
    it('should put the success action with the retrieved permissions', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call(worldsApi.postPermissionType, worldName, worldPermissionNames, worldPermissionType), Promise.resolve(true)]])
        .put(postWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType))
        .dispatch(postWorldPermissionsRequest(worldName, worldPermissionNames, worldPermissionType))
        .silentRun()
    })
  })
})

describe('when handling the request of putting an address to a world', () => {
  const worldName = 'some-world.dcl.eth'
  const worldPermissionNames = WorldPermissionNames.Access
  const worldPermissionType = WorldPermissionType.AllowList

  beforeEach(() => {
    worldsApi = new MockWorldsAPI(new AuthMock())
  })

  describe('when there is an error with the fetch', () => {
    let error: Error

    beforeEach(() => {
      error = new Error(`Couldn't add address`)
    })

    it('should put the failure action with the request action and the error message', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call(worldsApi.putPermissionType, worldName, worldPermissionNames, address), Promise.resolve(null)]])
        .put(putWorldPermissionsFailure(error.message))
        .dispatch(putWorldPermissionsRequest(worldName, worldPermissionNames, worldPermissionType, address))
        .silentRun()
    })
  })

  describe('when the permission fetch is successful', () => {
    it('should put the success action and request the new profile', () => {
      return expectSaga(worldsSaga, worldsApi)
        .provide([[call(worldsApi.putPermissionType, worldName, worldPermissionNames, address), Promise.resolve(true)]])
        .put(putWorldPermissionsSuccess(worldName, worldPermissionNames, worldPermissionType, address))
        .put(loadProfileRequest(address))
        .dispatch(putWorldPermissionsRequest(worldName, worldPermissionNames, worldPermissionType, address))
        .silentRun()
    })
  })
})
