import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { BuilderAPI } from 'lib/api/builder'
import {
  buyThirdPartyItemTiersFailure,
  buyThirdPartyItemTiersRequest,
  buyThirdPartyItemTiersSuccess,
  fetchThirdPartyItemTiersFailure,
  fetchThirdPartyItemTiersRequest,
  fetchThirdPartyItemTiersSuccess
} from './actions'
import { tiersSaga } from './sagas'
import { ChainId, Network } from '@dcl/schemas'
import { ThirdParty } from 'modules/thirdParty/types'
import { ThirdPartyItemTier } from './types'
import { call } from 'redux-saga/effects'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { ContractName, getContract } from 'decentraland-transactions'

let mockedBuilderApi: BuilderAPI
let thirdParty: ThirdParty
let thirdPartyItemTier: ThirdPartyItemTier
const defaultError = 'error'
const txHash = 'aTxHash'

beforeEach(() => {
  mockedBuilderApi = ({ fetchThirdPartyItemTiers: jest.fn() } as unknown) as BuilderAPI
  thirdParty = {
    id: '1',
    name: 'test',
    description: 'aDescription',
    managers: [],
    maxItems: '1',
    totalItems: '1'
  }
  thirdPartyItemTier = { id: '1', value: '1000', price: '1000' }
})

describe('when handling the request to fetch the third party item tiers', () => {
  describe('and the request fails', () => {
    it('should put the action signaling the fetching error with the error message', () => {
      return expectSaga(tiersSaga, mockedBuilderApi)
        .provide([[call([mockedBuilderApi, 'fetchThirdPartyItemTiers']), Promise.reject(new Error(defaultError))]])
        .put(fetchThirdPartyItemTiersFailure(defaultError))
        .dispatch(fetchThirdPartyItemTiersRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('and the request succeeds', () => {
    it('should put the action signaling the successful fetch with the retrieved item tiers', () => {
      return expectSaga(tiersSaga, mockedBuilderApi)
        .provide([[call([mockedBuilderApi, 'fetchThirdPartyItemTiers']), Promise.resolve([thirdPartyItemTier])]])
        .put(fetchThirdPartyItemTiersSuccess([thirdPartyItemTier]))
        .dispatch(fetchThirdPartyItemTiersRequest())
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the request to buy a third party item tier', () => {
  describe("and the chain id couldn't be retrieved", () => {
    it('should put the action signaling the failure of the purchase of an item slots tier with the tier and the third party id', () => {
      return expectSaga(tiersSaga, mockedBuilderApi)
        .provide([[call(getChainIdByNetwork, Network.MATIC), Promise.reject(new Error(defaultError))]])
        .put(buyThirdPartyItemTiersFailure(thirdParty.id, thirdPartyItemTier, defaultError))
        .dispatch(buyThirdPartyItemTiersRequest(thirdParty, thirdPartyItemTier))
        .run({ silenceTimeout: true })
    })
  })

  describe('and sending the transaction fails', () => {
    it('should put the action signaling the failure of the purchase of an item slots tier with the tier and the third party id', () => {
      return expectSaga(tiersSaga, mockedBuilderApi)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [matchers.call.fn(sendTransaction), Promise.reject(new Error(defaultError))]
        ])
        .put(buyThirdPartyItemTiersFailure(thirdParty.id, thirdPartyItemTier, defaultError))
        .dispatch(buyThirdPartyItemTiersRequest(thirdParty, thirdPartyItemTier))
        .run({ silenceTimeout: true })
    })
  })

  describe('and sending the transaction succeeds', () => {
    let contract: any
    beforeEach(() => {
      contract = { buyItemSlots: jest.fn() }
    })

    it('should put the action signaling the successful purchase of an item slots tier with the tier, the third party and the transaction details', async () => {
      return expectSaga(tiersSaga, mockedBuilderApi)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_MUMBAI), contract],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(buyThirdPartyItemTiersSuccess(txHash, ChainId.MATIC_MUMBAI, thirdParty, thirdPartyItemTier))
        .dispatch(buyThirdPartyItemTiersRequest(thirdParty, thirdPartyItemTier))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the successful purchase of a third party item tier', () => {
  it('should put the action to close the modal to buy the item tiers', () => {
    return expectSaga(tiersSaga, mockedBuilderApi)
      .put(closeModal('BuyItemSlotsModal'))
      .dispatch(buyThirdPartyItemTiersSuccess('aTxHash', ChainId.ETHEREUM_GOERLI, thirdParty, thirdPartyItemTier))
      .run({ silenceTimeout: true })
  })
})
