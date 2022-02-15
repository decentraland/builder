import { call } from '@redux-saga/core/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { AuthIdentity } from 'dcl-crypto'
import { Provider, Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ChainId, Network } from '@dcl/schemas'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { ContractName, getContract } from 'decentraland-transactions'
import { loginSuccess } from 'modules/identity/actions'
import { BuilderAPI } from 'lib/api/builder'
import { ThirdParty } from './types'
import {
  fetchThirdPartiesRequest,
  fetchThirdPartiesFailure,
  fetchThirdPartiesSuccess,
  fetchThirdPartyItemSlotPriceFailure,
  fetchThirdPartyItemSlotPriceRequest,
  fetchThirdPartyItemSlotPriceSuccess,
  buyThirdPartyItemSlotFailure,
  buyThirdPartyItemSlotRequest,
  buyThirdPartyItemSlotSuccess
} from './actions'
import { thirdPartySaga, getContractInstance } from './sagas'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getItemSlotPrice } from './selectors'
import { select } from 'redux-saga-test-plan/matchers'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'

const mockBuilder = ({ fetchThirdParties: jest.fn() } as any) as BuilderAPI

let thirdParty: ThirdParty
const defaultError = 'error'
const txHash = 'mockedHash'
const mockedSlotsToBuy = 10

beforeEach(() => {
  thirdParty = {
    id: '1',
    name: 'test',
    description: 'aDescription',
    managers: [],
    maxItems: '1',
    totalItems: '1'
  }
})

describe('when the login action succeeds', () => {
  let wallet: Wallet
  let identity: AuthIdentity

  beforeEach(() => {
    wallet = { address: '0x123' } as Wallet
    identity = {} as AuthIdentity
  })

  it('should put the fetch third party request action', () => {
    return expectSaga(thirdPartySaga, mockBuilder)
      .put(fetchThirdPartiesRequest(wallet.address))
      .dispatch(loginSuccess(wallet, identity))
      .run({ silenceTimeout: true })
  })
})

describe('when fetching third parties', () => {
  describe('when the api request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put the fetch third party fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[matchers.call.fn(mockBuilder.fetchThirdParties), throwError(new Error(errorMessage))]])
        .put(fetchThirdPartiesFailure(errorMessage))
        .dispatch(fetchThirdPartiesRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    let thirdParties: ThirdParty[]

    beforeEach(() => {
      thirdParties = [
        {
          id: '1',
          name: 'a third party',
          description: 'some desc',
          managers: ['0x1', '0x2'],
          maxItems: '0',
          totalItems: '0'
        },
        { id: '2', name: 'a third party', description: 'some desc', managers: ['0x3'], maxItems: '0', totalItems: '0' }
      ]
    })

    describe('when an address is supplied in the action payload', () => {
      let address: string

      beforeEach(() => {
        address = '0x1'
      })

      it('should pass the address to the api and put the fetch third party success action the response', () => {
        return expectSaga(thirdPartySaga, mockBuilder)
          .provide([[call([mockBuilder, 'fetchThirdParties'], address), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest(address))
          .run({ silenceTimeout: true })
      })
    })

    describe('when no address is supplied', () => {
      it('should put the fetch third party success action with the api response', () => {
        return expectSaga(thirdPartySaga, mockBuilder)
          .provide([[matchers.call.fn(mockBuilder.fetchThirdParties), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest())
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when handling the request to fetch the third party item slot price', () => {
  describe('and the request fails', () => {
    it('should put the action signaling the fetching error with the error message', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_MUMBAI), Promise.reject(new Error(defaultError))]
        ])
        .put(fetchThirdPartyItemSlotPriceFailure(defaultError))
        .dispatch(fetchThirdPartyItemSlotPriceRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('and the request succeeds', () => {
    let mockedSlotPrice: BigNumber
    let mockedOracleRate: BigNumber
    let mockedTPContract: { itemSlotPrice: () => BigNumber }
    let mockedOracleContract: { getRate: () => BigNumber }

    beforeEach(() => {
      mockedSlotPrice = BigNumber.from('1000000000000000000')
      mockedOracleRate = BigNumber.from('1000000000000000000')
      mockedTPContract = {
        itemSlotPrice: () => mockedSlotPrice
      }
      mockedOracleContract = {
        getRate: () => mockedOracleRate
      }
    })
    it('should put the action signaling the successful fetch with the retrieved item slot price', () => {
      const mockedProvider = {}
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [call(getNetworkProvider, ChainId.MATIC_MUMBAI), mockedProvider],
          [
            call(getContractInstance, ContractName.ThirdPartyRegistry, ChainId.MATIC_MUMBAI, (mockedProvider as unknown) as Provider),
            mockedTPContract
          ],
          [
            call(getContractInstance, ContractName.ChainlinkOracle, ChainId.MATIC_MUMBAI, (mockedProvider as unknown) as Provider),
            mockedOracleContract
          ]
        ])
        .put(fetchThirdPartyItemSlotPriceSuccess(Number(mockedSlotPrice.div(mockedOracleRate))))
        .dispatch(fetchThirdPartyItemSlotPriceRequest())
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the request to buy third party item slots', () => {
  const mockedSlotPriceInMANA = 10
  describe("and the chain id couldn't be retrieved", () => {
    it('should put the action signaling the failure of the purchase of item slots with third party id', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[call(getChainIdByNetwork, Network.MATIC), Promise.reject(new Error(defaultError))]])
        .put(buyThirdPartyItemSlotFailure(thirdParty.id, 10, defaultError))
        .dispatch(buyThirdPartyItemSlotRequest(thirdParty, 10, 10))
        .run({ silenceTimeout: true })
    })
  })

  describe('and sending the transaction fails', () => {
    it('should put the action signaling the failure of the purchase of item slots with the slot amount and the third party id', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [select(getItemSlotPrice), mockedSlotPriceInMANA],
          [matchers.call.fn(sendTransaction), Promise.reject(new Error(defaultError))]
        ])
        .dispatch(buyThirdPartyItemSlotRequest(thirdParty, mockedSlotsToBuy, mockedSlotPriceInMANA))
        .put(buyThirdPartyItemSlotFailure(thirdParty.id, mockedSlotPriceInMANA, defaultError))
        .run({ silenceTimeout: true })
    })
  })

  describe('and sending the transaction succeeds', () => {
    it('should put the action signaling the successful purchase of item slots with the slot amount, the third party and the transaction details', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [select(getItemSlotPrice), mockedSlotPriceInMANA],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(buyThirdPartyItemSlotSuccess(txHash, ChainId.MATIC_MUMBAI, thirdParty, mockedSlotsToBuy))
        .dispatch(buyThirdPartyItemSlotRequest(thirdParty, mockedSlotsToBuy, mockedSlotPriceInMANA))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the successful purchase of a third party item slot', () => {
  it('should put the action to close the modal to buy the item slots', () => {
    return expectSaga(thirdPartySaga, mockBuilder)
      .put(closeModal('BuyItemSlotsModal'))
      .dispatch(buyThirdPartyItemSlotSuccess('aTxHash', ChainId.ETHEREUM_GOERLI, thirdParty, 10))
      .run({ silenceTimeout: true })
  })
})
