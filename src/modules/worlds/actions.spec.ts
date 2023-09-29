import { WalletStats } from 'lib/api/worlds'
import {
  FETCH_WALLET_WORLDS_STATS_FAILURE,
  FETCH_WALLET_WORLDS_STATS_REQUEST,
  FETCH_WALLET_WORLDS_STATS_SUCCESS,
  fetchWalletWorldsStatsFailure,
  fetchWalletWorldsStatsRequest,
  fetchWalletWorldsStatsSuccess
} from './actions'

let address: string

beforeEach(() => {
  address = '0x123'
})

describe('when creating the request action to fetch worlds stats for a wallet', () => {
  it('should return the request action to fetch worlds stats for a wallet', () => {
    expect(fetchWalletWorldsStatsRequest(address)).toEqual({
      type: FETCH_WALLET_WORLDS_STATS_REQUEST,
      payload: {
        address
      }
    })
  })
})

describe('when creating the success action to fetch worlds stats for a wallet', () => {
  let stats: WalletStats

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
    expect(fetchWalletWorldsStatsSuccess(address, stats)).toEqual({
      type: FETCH_WALLET_WORLDS_STATS_SUCCESS,
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
    expect(fetchWalletWorldsStatsFailure(address, error)).toEqual({
      type: FETCH_WALLET_WORLDS_STATS_FAILURE,
      payload: {
        address,
        error
      }
    })
  })
})
