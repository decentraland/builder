import { WorldPermissionNames, WorldPermissionType, WorldPermissions, WorldsWalletStats } from 'lib/api/worlds'
import {
  deleteWorldPermissionsFailure,
  deleteWorldPermissionsRequest,
  deleteWorldPermissionsSuccess,
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
import { INITIAL_STATE, WorldsState, worldsReducer } from './reducer'

let state: WorldsState
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
  state = INITIAL_STATE
})

describe('when handling the action to fetch worlds stats for a wallet', () => {
  let address: string

  beforeEach(() => {
    address = '0x123'
  })

  describe('when handling the request action to fetch worlds stats for a wallet', () => {
    beforeEach(() => {
      state.error = 'some error'
    })

    it('should add the action to the loading state and remove the error', () => {
      const action = fetchWorldsWalletStatsRequest(address)
      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [action],
        error: null
      })
    })
  })

  describe('when handling the failure action to fetch worlds stats for a wallet', () => {
    let error: string

    beforeEach(() => {
      error = 'some error'
      state.loading = [fetchWorldsWalletStatsRequest(address)]
    })

    it('should remove the action from loading and set the error', () => {
      const action = fetchWorldsWalletStatsFailure(address, error)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        error
      })
    })
  })

  describe('when handling the success action to fetch worlds stats for a wallet', () => {
    let stats: WorldsWalletStats

    beforeEach(() => {
      stats = {
        dclNames: [],
        ensNames: [],
        maxAllowedSpace: '',
        usedSpace: '',
        wallet: address
      }

      state.loading = [fetchWorldsWalletStatsRequest(address)]
    })

    it('should remove the action from loading and set the stats', () => {
      const action = fetchWorldsWalletStatsSuccess(address, stats)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        walletStats: {
          [address]: stats
        }
      })
    })
  })
})

describe('when handling the action to get worlds permissions for a world name', () => {
  let worldName: string

  beforeEach(() => {
    worldName = 'world-name.dcl.eth'
  })

  describe('when handling the request action to get worlds permissions for a world name', () => {
    beforeEach(() => {
      state.error = 'some error'
      state.loading = []
    })

    it('should add the action to the loading state and remove the error', () => {
      const action = getWorldPermissionsRequest(worldName)
      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [action],
        error: null
      })
    })
  })

  describe('when handling the failure action to get worlds permissions for a world name', () => {
    let error: string

    beforeEach(() => {
      error = 'some error'
      state.loading = [getWorldPermissionsRequest(worldName)]
    })

    it('should remove the action from loading and set the error', () => {
      const action = getWorldPermissionsFailure(worldName, error)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        error
      })
    })
  })

  describe('when handling the success action to get worlds permissions for a world name', () => {
    beforeEach(() => {
      state.loading = [getWorldPermissionsRequest(worldName)]
    })

    it('should remove the action from loading and set the permissions', () => {
      const action = getWorldPermissionsSuccess(worldName, worldPermissionsMock)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        worldsPermissions: {
          [worldName]: worldPermissionsMock
        }
      })
    })
  })
})

describe('when handling the action to post permission type for a world name', () => {
  let worldName: string

  beforeEach(() => {
    worldName = 'world-name.dcl.eth'
  })

  describe('when handling the request action to post permission type for a world name', () => {
    beforeEach(() => {
      state.error = 'some error'
      state.loading = []
    })

    it('should add the action to the loading state and remove the error', () => {
      const action = postWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList)
      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [action],
        error: null
      })
    })
  })

  describe('when handling the failure action to post permission type for a world name', () => {
    let error: string

    beforeEach(() => {
      error = 'some error'
      state.loading = [postWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList)]
    })

    it('should remove the action from loading and set the error', () => {
      const action = postWorldPermissionsFailure(error)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        error
      })
    })
  })

  describe('when handling the success action to post permission type for a world name', () => {
    beforeEach(() => {
      state.loading = [postWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList)]
      state.worldsPermissions[worldName] = worldPermissionsMock
    })

    it('should remove the action from loading and set the stats', () => {
      const action = postWorldPermissionsSuccess(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        worldsPermissions: {
          [worldName]: {
            ...worldPermissionsMock,
            deployment: {
              type: WorldPermissionType.AllowList,
              wallets: []
            }
          }
        }
      })
    })
  })
})

describe('when handling the action to add an address to the deployment permission for a world name', () => {
  let worldName: string
  let addressWallet: string

  beforeEach(() => {
    worldName = 'world-name.dcl.eth'
    addressWallet = '0x123'
  })

  describe('when handling the request action to add an address to the deployment permission for a world name', () => {
    beforeEach(() => {
      state.error = 'some error'
      state.loading = []
    })

    it('should add the action to the loading state and remove the error', () => {
      const action = putWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)
      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [action],
        error: null
      })
    })
  })

  describe('when handling the failure action to add an address to the deployment permission for a world name', () => {
    let error: string

    beforeEach(() => {
      error = 'some error'
      state.loading = [putWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)]
    })

    it('should remove the action from loading and set the error', () => {
      const action = putWorldPermissionsFailure(error)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        error
      })
    })
  })

  describe('when handling the success action to add an address to the deployment permission for a world name', () => {
    beforeEach(() => {
      state.loading = [putWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)]
      state.worldsPermissions[worldName] = worldPermissionsMock
    })

    it('should remove the action from loading and set the new address in the wallets for deployment permission', () => {
      const action = putWorldPermissionsSuccess(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        worldsPermissions: {
          [worldName]: {
            ...worldPermissionsMock,
            deployment: {
              type: WorldPermissionType.AllowList,
              wallets: [addressWallet]
            }
          }
        }
      })
    })
  })
})

describe('when handling the action to delete an address from deployment permission for a world name', () => {
  let worldName: string
  let addressWallet: string

  beforeEach(() => {
    worldName = 'world-name.dcl.eth'
    addressWallet = '0x123'
  })

  describe('when handling the request action to delete an address from deployment permission for a world name', () => {
    beforeEach(() => {
      state.error = 'some error'
      state.loading = []
    })

    it('should add the action to the loading state and remove the error', () => {
      const action = deleteWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)
      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [action],
        error: null
      })
    })
  })

  describe('when handling the failure action to delete an address from deployment permission for a world name', () => {
    let error: string

    beforeEach(() => {
      error = 'some error'
      state.loading = [
        deleteWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)
      ]
    })

    it('should remove the action from loading and set the error', () => {
      const action = deleteWorldPermissionsFailure(error)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        error
      })
    })
  })

  describe('when handling the success action to delete an address from deployment permission for a world name', () => {
    beforeEach(() => {
      state.loading = [
        deleteWorldPermissionsRequest(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)
      ]
      state.worldsPermissions[worldName] = {
        ...worldPermissionsMock,
        deployment: {
          type: WorldPermissionType.AllowList,
          wallets: [addressWallet]
        }
      }
    })

    it('should remove the action from loading and remove the wallet address from the wallets list of the given permission', () => {
      const action = deleteWorldPermissionsSuccess(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, addressWallet)

      expect(worldsReducer(state, action)).toEqual({
        ...state,
        loading: [],
        worldsPermissions: {
          [worldName]: {
            ...worldPermissionsMock,
            deployment: {
              type: WorldPermissionType.AllowList,
              wallets: []
            }
          }
        }
      })
    })
  })
})
