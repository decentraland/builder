import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { BuilderClient } from '@dcl/builder-client'
import { ChainId, Network } from '@dcl/schemas'
import { ERC20__factory, ERC20, DCLController__factory, DCLRegistrar__factory, ENS__factory } from 'contracts'
import { getChainIdByNetwork, getSigner } from 'decentraland-dapps/dist/lib/eth'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { ethers } from 'ethers'
import { CONTROLLER_V2_ADDRESS, ENS_ADDRESS, MANA_ADDRESS, REGISTRAR_ADDRESS } from 'modules/common/contracts'
import { DclLisstAPI } from 'lib/api/lists'
import { WorldsAPI } from 'lib/api/worlds'
import { MarketplaceAPI } from 'lib/api/marketplace'
import { getLands } from 'modules/land/selectors'
import { getWallet } from 'modules/wallet/utils'
import { allowClaimManaRequest, claimNameRequest, fetchENSAuthorizationRequest, fetchENSListRequest, fetchENSListSuccess } from './actions'
import { ensSaga } from './sagas'
import { ENS } from './types'

jest.mock('@dcl/builder-client')

const MockBuilderClient = BuilderClient as jest.MockedClass<typeof BuilderClient>

let builderClient: BuilderClient
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

    await expectSaga(ensSaga, builderClient)
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

    await expectSaga(ensSaga, builderClient)
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

    await expectSaga(ensSaga, builderClient)
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

      await expectSaga(ensSaga, builderClient)
        .provide([
          [call(getSigner), signer],
          [call(getWallet), { address, chainId: ChainId.ETHEREUM_GOERLI }],
          [select(getLands), []],
          [matchers.call.fn(DclLisstAPI.prototype.fetchBannedNames), bannedNames],
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
