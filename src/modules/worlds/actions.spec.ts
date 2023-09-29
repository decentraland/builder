import { WorldsWalletStats } from 'lib/api/worlds'
import {
  FETCH_WORLDS_WALLET_STATS_FAILURE,
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  FETCH_WORLDS_WALLET_STATS_SUCCESS,
  fetchWorldsWalletStatsFailure,
  fetchWorldsWalletStatsRequest,
  fetchWorldsWalletStatsSuccess
} from './actions'

let address: string

beforeEach(() => {
  address = '0x123'
})

describe('when creating the request action to fetch worlds stats for a wallet', () => {
  it('should return the request action to fetch worlds stats for a wallet', () => {
    expect(fetchWorldsWalletStatsRequest(address)).toEqual({
      type: FETCH_WORLDS_WALLET_STATS_REQUEST,
      payload: {
        address
      }
    })
  })
})

describe('when creating the success action to fetch worlds stats for a wallet', () => {
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

  it('should return the success action to fetch worlds stats for a wallet', () => {
    expect(fetchWorldsWalletStatsSuccess(address, stats)).toEqual({
      type: FETCH_WORLDS_WALLET_STATS_SUCCESS,
      payload: {
        address,
        stats
      }
    })
  })
})

describe('when creating the failure action to fetch worlds stats for a wallet', () => {
  let error: string

  beforeEach(() => {
    error = 'some error'
  })

  it('should return the failure action to fetch worlds stats for a wallet', () => {
    expect(fetchWorldsWalletStatsFailure(address, error)).toEqual({
      type: FETCH_WORLDS_WALLET_STATS_FAILURE,
      payload: {
        address,
        error
      }
    })
  })
})
