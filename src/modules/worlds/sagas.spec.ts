import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import { throwError } from 'redux-saga-test-plan/providers'
import { connectWalletSuccess } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { WorldsWalletStats, content } from 'lib/api/worlds'
import { getAddressOrWaitConnection } from 'modules/wallet/utils'
import { fetchWorldsWalletStatsFailure, fetchWorldsWalletStatsRequest, fetchWorldsWalletStatsSuccess } from './actions'
import { worldsSaga } from './sagas'

let address: string | undefined

describe('when handling the request action to fetch worlds stats for a wallet', () => {
  let stats: WorldsWalletStats

  describe('when the address is provided in the action', () => {
    beforeEach(() => {
      address = '0x123'
    })

    describe('when the worlds api request throws an error', () => {
      let error: Error

      beforeEach(() => {
        error = new Error('some error')
      })

      it('should put the failure action with the request action address and the error message', () => {
        return expectSaga(worldsSaga)
          .provide([[call([content, content.fetchWalletStats], address!), throwError(error)]])
          .put(fetchWorldsWalletStatsFailure(error.message, address))
          .dispatch(fetchWorldsWalletStatsRequest(address))
          .silentRun()
      })
    })

    describe('when the worlds api request returns null', () => {
      it('should put the failure action with the request action address and the error message', () => {
        return expectSaga(worldsSaga)
          .provide([[call([content, content.fetchWalletStats], address!), null]])
          .put(fetchWorldsWalletStatsFailure('Could not fetch wallet stats', address))
          .dispatch(fetchWorldsWalletStatsRequest(address))
          .silentRun()
      })
    })

    describe('when the worlds api request returns the stats', () => {
      beforeEach(() => {
        stats = {
          dclNames: [],
          ensNames: [],
          maxAllowedSpace: '',
          usedSpace: '',
          wallet: address!
        }
      })

      it('should put the success action with the request action address and the stats', () => {
        return expectSaga(worldsSaga)
          .provide([[call([content, content.fetchWalletStats], address!), stats]])
          .put(fetchWorldsWalletStatsSuccess(address!, stats))
          .dispatch(fetchWorldsWalletStatsRequest(address))
          .silentRun()
      })
    })
  })

  describe('when the address is not provided in the action', () => {
    let getAddressOrWaitConnectionResult: string | undefined

    beforeEach(() => {
      address = undefined
    })

    describe('and the get address or wait for connection function returns an address', () => {
      beforeEach(() => {
        getAddressOrWaitConnectionResult = '0x123'
      })

      describe('and the request to fetch wallet stats responds with the wallet stats', () => {
        beforeEach(() => {
          stats = {
            dclNames: [],
            ensNames: [],
            maxAllowedSpace: '',
            usedSpace: '',
            wallet: getAddressOrWaitConnectionResult!
          }
        })

        it('should put the success action with the address from the get address or wait for connection function and the stats', () => {
          return expectSaga(worldsSaga)
            .provide([
              [call(getAddressOrWaitConnection), getAddressOrWaitConnectionResult],
              [call([content, content.fetchWalletStats], getAddressOrWaitConnectionResult!), stats]
            ])
            .put(fetchWorldsWalletStatsSuccess(getAddressOrWaitConnectionResult!, stats))
            .dispatch(fetchWorldsWalletStatsRequest(address))
            .silentRun()
        })
      })
    })

    describe('and the get address or wait for connection function does not return an address', () => {
      beforeEach(() => {
        getAddressOrWaitConnectionResult = undefined
      })

      it('should put a failure action with an undefined address and the error message', () => {
        return expectSaga(worldsSaga)
          .provide([[call(getAddressOrWaitConnection), getAddressOrWaitConnectionResult]])
          .put(fetchWorldsWalletStatsFailure('An address is required', getAddressOrWaitConnectionResult))
          .dispatch(fetchWorldsWalletStatsRequest(address))
          .silentRun()
      })
    })
  })
})

describe('when the wallet connects', () => {
  beforeEach(() => {
    address = '0x123'
  })

  it('should put the action to fetch worlds stats for the connected wallet address', () => {
    return expectSaga(worldsSaga)
      .put(fetchWorldsWalletStatsRequest(address))
      .dispatch(connectWalletSuccess({ address: address! } as Wallet))
      .silentRun()
  })
})
