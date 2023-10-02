import { expectSaga } from 'redux-saga-test-plan'
import { select, take } from 'redux-saga/effects'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import {
  CONNECT_WALLET_FAILURE,
  CONNECT_WALLET_SUCCESS,
  connectWalletFailure,
  connectWalletSuccess
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { getAddressOrWaitConnection } from './utils'

describe('when calling the get address or wait for connection function', () => {
  let connectedAddress: string | undefined

  describe('when there is a wallet already connected', () => {
    beforeEach(() => {
      connectedAddress = '0x123'
    })

    it('should return the address from the connected wallet', () => {
      return expectSaga(getAddressOrWaitConnection)
        .provide([[select(getAddress), connectedAddress]])
        .returns(connectedAddress)
        .silentRun()
    })
  })

  describe('when there is no wallet already connected', () => {
    beforeEach(() => {
      connectedAddress = undefined
    })

    describe('and the wallet connects successfully', () => {
      it('should return the address from the connected wallet', () => {
        const connectionSuccessAddress = '0x123'

        return expectSaga(getAddressOrWaitConnection)
          .provide([
            [select(getAddress), connectedAddress],
            [take(CONNECT_WALLET_SUCCESS), connectWalletSuccess({ address: connectionSuccessAddress } as Wallet)]
          ])
          .returns(connectionSuccessAddress)
          .silentRun()
      })
    })

    describe('and the wallet fails to connect', () => {
      it('should return undefined', () => {
        return expectSaga(getAddressOrWaitConnection)
          .provide([
            [select(getAddress), connectedAddress],
            [take(CONNECT_WALLET_FAILURE), connectWalletFailure('some error')]
          ])
          .returns(undefined)
          .silentRun()
      })
    })
  })
})
