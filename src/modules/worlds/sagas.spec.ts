import { expectSaga } from 'redux-saga-test-plan'
import { call, select, take } from 'redux-saga/effects'
import { throwError } from 'redux-saga-test-plan/providers'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import {
  CONNECT_WALLET_FAILURE,
  CONNECT_WALLET_SUCCESS,
  connectWalletFailure,
  connectWalletSuccess
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { WorldsWalletStats, content } from 'lib/api/worlds'
import { fetchWorldsWalletStatsFailure, fetchWorldsWalletStatsRequest, fetchWorldsWalletStatsSuccess } from './actions'
import { worldsSaga } from './sagas'

describe('when handling the request action to fetch worlds stats for a wallet', () => {
  let address: string | undefined
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
    let addressInStore: string | undefined

    beforeEach(() => {
      address = undefined
    })

    describe('and there is an address available in the store', () => {
      beforeEach(() => {
        addressInStore = '0x123'
      })

      describe('and the request to fetch wallet stats responds with the worlds wallet stats', () => {
        beforeEach(() => {
          stats = {
            dclNames: [],
            ensNames: [],
            maxAllowedSpace: '',
            usedSpace: '',
            wallet: addressInStore!
          }
        })

        it('should put the success action with the address in the store and the stats', () => {
          return expectSaga(worldsSaga)
            .provide([
              [select(getAddress), addressInStore],
              [call([content, content.fetchWalletStats], addressInStore!), stats]
            ])
            .put(fetchWorldsWalletStatsSuccess(addressInStore!, stats))
            .dispatch(fetchWorldsWalletStatsRequest(address))
            .silentRun()
        })
      })
    })

    describe('and there is no address available in the store', () => {
      let connectProvider: any
      let connectionAddress: string

      beforeEach(() => {
        addressInStore = undefined
      })

      describe('and the wallet connection fails', () => {
        beforeEach(() => {
          connectProvider = [take(CONNECT_WALLET_FAILURE), connectWalletFailure('some error')]
        })

        it('should put a failure action with an undefined address and the error message', () => {
          return expectSaga(worldsSaga)
            .provide([[select(getAddress), addressInStore], connectProvider])
            .put(fetchWorldsWalletStatsFailure('An address is required', addressInStore))
            .dispatch(fetchWorldsWalletStatsRequest(address))
            .silentRun()
        })
      })

      describe('and the wallet connection does not fail', () => {
        beforeEach(() => {
          connectionAddress = '0x123'
          connectProvider = [take(CONNECT_WALLET_SUCCESS), connectWalletSuccess({ address: connectionAddress } as Wallet)]
        })

        describe('and the request to fetch wallet stats responds with the worlds wallet stats', () => {
          beforeEach(() => {
            stats = {
              dclNames: [],
              ensNames: [],
              maxAllowedSpace: '',
              usedSpace: '',
              wallet: connectionAddress
            }
          })

          it('should put the success action with the connection address and the stats', () => {
            return expectSaga(worldsSaga)
              .provide([
                [select(getAddress), addressInStore],
                connectProvider,
                [call([content, content.fetchWalletStats], connectionAddress), stats]
              ])
              .put(fetchWorldsWalletStatsSuccess(connectionAddress, stats))
              .dispatch(fetchWorldsWalletStatsRequest(address))
              .silentRun()
          })
        })
      })
    })
  })
})
