import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { BuilderClient } from '@dcl/builder-client'
import { ChainId, Network } from '@dcl/schemas'
import { ERC20__factory, ERC20, DCLController__factory, DCLRegistrar__factory, ENS__factory } from 'contracts'
import { getChainIdByNetwork, getSigner } from 'decentraland-dapps/dist/lib/eth'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { ethers } from 'ethers'
import { CONTROLLER_V2_ADDRESS, ENS_ADDRESS, MANA_ADDRESS, REGISTRAR_ADDRESS } from 'modules/common/contracts'
import { DclListsAPI } from 'lib/api/lists'
import { WorldsAPI } from 'lib/api/worlds'
import { MarketplaceAPI } from 'lib/api/marketplace'
import { ENSApi } from 'lib/api/ens'
import { getLands } from 'modules/land/selectors'
import { getWallet } from 'modules/wallet/utils'
import {
  allowClaimManaRequest,
  claimNameRequest,
  fetchENSAuthorizationRequest,
  fetchENSListRequest,
  fetchENSListSuccess,
  fetchExternalENSNamesFailure,
  fetchExternalENSNamesRequest,
  fetchExternalENSNamesSuccess
} from './actions'
import { ensSaga } from './sagas'
import { ENS, ENSError } from './types'

jest.mock('@dcl/builder-client')

const MockBuilderClient = BuilderClient as jest.MockedClass<typeof BuilderClient>

let builderClient: BuilderClient
let ensApi: ENSApi
let manaContract: ERC20
let dclRegistrarContract: DCLRegistrar__factory
let ensFactoryContract: ENS__factory

beforeEach(() => {
  builderClient = new MockBuilderClient(
    'url',
    {
      authChain: [],
      ephemeralIdentity: { address: 'address', privateKey: 'prikey', publicKey: 'pubkey' },
      expiration: new Date()
    },
    'address'
  )

  ensApi = new ENSApi('https://ens-subgraph.com')

  manaContract = {
    approve: jest.fn(),
    allowance: jest.fn()
  } as unknown as ERC20
  dclRegistrarContract = {
    getTokenId: jest.fn().mockResolvedValue('tokenId')
  } as unknown as DCLRegistrar__factory
  ensFactoryContract = {
    resolver: jest.fn().mockResolvedValue(ethers.constants.AddressZero),
    owner: jest.fn().mockResolvedValue('address')
  } as unknown as ENS__factory
})

describe('when handling the approve claim mana request', () => {
  it('should call the manaContract approve function with the dcl controller v2 address', async () => {
    const allowance = '100'
    const signer = {} as ethers.Signer

    await expectSaga(ensSaga, builderClient, ensApi)
      .provide([
        [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_GOERLI }],
        [call(getSigner), signer],
        [call([ERC20__factory, 'connect'], MANA_ADDRESS, signer), manaContract]
      ])
      .call([manaContract, 'approve'], CONTROLLER_V2_ADDRESS, allowance)
      .dispatch(allowClaimManaRequest(allowance))
      .silentRun()
  })
})

describe('when handling the fetch of authorizations request', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call mana.allowance with the dcl controller v2 address', async () => {
    const from = 'address'

    jest.spyOn(ethers, 'Contract').mockReturnValueOnce(manaContract)

    await expectSaga(ensSaga, builderClient, ensApi)
      .provide([
        [select(getAddress), from],
        [call(getChainIdByNetwork, Network.ETHEREUM), ChainId.ETHEREUM_GOERLI]
      ])
      .call(manaContract.allowance, from, CONTROLLER_V2_ADDRESS)
      .dispatch(fetchENSAuthorizationRequest())
      .silentRun()
  })
})

describe('when handling the claim name request', () => {
  it('should call DCLController__factory.connect with the dcl controller v2 address', async () => {
    const signer = {} as ethers.Signer

    await expectSaga(ensSaga, builderClient, ensApi)
      .provide([
        [call(getWallet), { address: 'address' }],
        [call(getSigner), signer]
      ])
      .call([DCLController__factory, 'connect'], CONTROLLER_V2_ADDRESS, signer)
      .dispatch(claimNameRequest('name'))
      .silentRun()
  })

  describe('when handling the fetch ens list request', () => {
    let address: string

    beforeEach(() => {
      address = '0xanAddress'
      jest.spyOn(WorldsAPI.prototype, 'fetchWorld').mockResolvedValue(null)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    it('should filter the list of names based on the banned names', async () => {
      const bannedNames = ['name1', 'name2', 'name3']
      const ensNames = ['name1', 'name2', 'name3', 'name4', 'name5', 'name6']
      const validDomains = ensNames.filter(domain => !bannedNames.includes(domain))
      const baseENSData = {
        tokenId: 'tokenId',
        ensOwnerAddress: 'address',
        nftOwnerAddress: '0xanAddress',
        resolver: '0x0000000000000000000000000000000000000000',
        content: '',
        landId: undefined,
        worldStatus: null
      }
      const ENSList: ENS[] = validDomains.map(domain => ({
        name: domain,
        subdomain: `${domain}.dcl.eth`,
        ...baseENSData
      }))
      const signer = {} as ethers.Signer

      await expectSaga(ensSaga, builderClient, ensApi)
        .provide([
          [call(getSigner), signer],
          [call(getWallet), { address, chainId: ChainId.ETHEREUM_GOERLI }],
          [select(getLands), []],
          [matchers.call.fn(DclListsAPI.prototype.fetchBannedNames), bannedNames],
          [matchers.call.fn(MarketplaceAPI.prototype.fetchENSList), ensNames],
          [matchers.call.fn(WorldsAPI.prototype.fetchWorld), undefined],
          [call([ENS__factory, 'connect'], ENS_ADDRESS, signer), ensFactoryContract],
          [call([DCLRegistrar__factory, 'connect'], REGISTRAR_ADDRESS, signer), dclRegistrarContract]
        ])
        .put(fetchENSListSuccess(ENSList))
        .dispatch(fetchENSListRequest())
        .silentRun()
    })
  })
})

describe('when handling the fetching of external ens names for an owner', () => {
  let owner: string

  beforeEach(() => {
    owner = '0x123'
  })

  describe('when fetchENSList throws an error', () => {
    let error: Error
    let ensError: ENSError

    beforeEach(() => {
      error = new Error('Some Error')
      ensError = { message: error.message }
    })

    it('should dispatch an error action with the owner and the error', async () => {
      await expectSaga(ensSaga, builderClient, ensApi)
        .provide([[call([ensApi, ensApi.fetchENSList], owner), throwError(error)]])
        .put(fetchExternalENSNamesFailure(owner, ensError))
        .dispatch(fetchExternalENSNamesRequest(owner))
        .silentRun()
    })
  })

  describe('when fetchENSList returns an array of names', () => {
    let names: string[]

    beforeEach(() => {
      names = ['name1.eth', 'name2.eth']
    })

    it('should dispatch an error action with the owner and the error', async () => {
      await expectSaga(ensSaga, builderClient, ensApi)
        .provide([[call([ensApi, ensApi.fetchENSList], owner), names]])
        .put(fetchExternalENSNamesSuccess(owner, names))
        .dispatch(fetchExternalENSNamesRequest(owner))
        .silentRun()
    })
  })
})
