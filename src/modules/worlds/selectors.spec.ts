import { RootState } from 'modules/common/types'
import { INITIAL_STATE } from './reducer'
import { getConnectedWalletStats, getData, getError, getLoading, getState, getWalletStats } from './selectors'

let connectedWallet: string
let state: RootState

beforeEach(() => {
  connectedWallet = '0x123'

  state = {
    worlds: { ...INITIAL_STATE, walletStats: { [connectedWallet]: {} } },
    wallet: {
      data: {
        address: connectedWallet
      }
    }
  } as RootState
})

describe('when getting the worlds state', () => {
  it('should return the worlds state', () => {
    expect(getState(state)).toEqual(state.worlds)
  })
})

describe('when getting the worlds data', () => {
  it('should return the worlds data', () => {
    expect(getData(state)).toEqual(state.worlds.data)
  })
})

describe('when getting the worlds loading', () => {
  it('should return the worlds loading', () => {
    expect(getLoading(state)).toEqual(state.worlds.loading)
  })
})

describe('when getting the worlds error', () => {
  it('should return the worlds error', () => {
    expect(getError(state)).toEqual(state.worlds.error)
  })
})

describe('when getting the worlds wallet stats', () => {
  it('should return the worlds wallet stats', () => {
    expect(getWalletStats(state)).toEqual(state.worlds.walletStats)
  })
})

describe('when getting the worlds wallet stats for the connected wallet', () => {
  it('should return the worlds wallet stats for the connected wallet', () => {
    expect(getConnectedWalletStats(state)).toEqual(state.worlds.walletStats[connectedWallet])
  })
})
