import { WorldsWalletStats } from 'lib/api/worlds'
import { fetchWorldsWalletStatsFailure, fetchWorldsWalletStatsRequest, fetchWorldsWalletStatsSuccess } from './actions'
import { INITIAL_STATE, WorldsState, worldsReducer } from './reducer'

let state: WorldsState

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
