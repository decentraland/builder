import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { BuilderClient } from '@dcl/builder-client'
import { ChainId, Network } from '@dcl/schemas'
import { ERC20__factory, ERC20, DCLController__factory, DCLRegistrar__factory, ENS__factory } from 'contracts'
import { getChainIdByNetwork, getSigner } from 'decentraland-dapps/dist/lib/eth'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { connectWalletSuccess } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { CONTROLLER_V2_ADDRESS, ENS_ADDRESS, MANA_ADDRESS, REGISTRAR_ADDRESS } from 'modules/common/contracts'
import { DclListsAPI } from 'lib/api/lists'
import { WorldInfo, WorldsAPI, content } from 'lib/api/worlds'
import { MarketplaceAPI } from 'lib/api/marketplace'
import { ENSApi } from 'lib/api/ens'
import { getLands } from 'modules/land/selectors'
import { getAddressOrWaitConnection, getWallet } from 'modules/wallet/utils'
import {
  allowClaimManaRequest,
  claimNameRequest,
  fetchENSAuthorizationRequest,
  fetchENSListRequest,
  fetchENSListSuccess,
  fetchENSWorldStatusFailure,
  fetchENSWorldStatusRequest,
  fetchENSWorldStatusSuccess,
  fetchExternalNamesFailure,
  fetchExternalNamesRequest,
  fetchExternalNamesSuccess
} from './actions'
import { ensSaga } from './sagas'
import { ENS, ENSError } from './types'
import { getENSBySubdomain, getExternalNames } from './selectors'

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
  const MOCK_ADDRESS = '0x123'

  describe('when the owner is not provided in the action', () => {
    let getAddressOrWaitConnectionResult: string | undefined

    describe('and the wallet address is obtained from the get address or wait connection function', () => {
      beforeEach(() => {
        getAddressOrWaitConnectionResult = MOCK_ADDRESS
      })

      it('should call the ens api with the address obtained from the get address or wait connection function', async () => {
        await expectSaga(ensSaga, builderClient, ensApi)
          .provide([
            [call(getAddressOrWaitConnection), getAddressOrWaitConnectionResult],
            [call([ensApi, ensApi.fetchExternalNames], getAddressOrWaitConnectionResult!), []]
          ])
          .put(fetchExternalNamesSuccess(getAddressOrWaitConnectionResult!, []))
          .dispatch(fetchExternalNamesRequest())
          .silentRun()
      })
    })
    describe('and the wallet address is not obtained from the get address or wait connection function', () => {
      beforeEach(() => {
        getAddressOrWaitConnectionResult = undefined
      })

      it('should dispatch an error action with undefined as the owner and the error', async () => {
        await expectSaga(ensSaga, builderClient, ensApi)
          .provide([[call(getAddressOrWaitConnection), getAddressOrWaitConnectionResult]])
          .put(fetchExternalNamesFailure({ message: 'No owner address provided' }, undefined))
          .dispatch(fetchExternalNamesRequest())
          .silentRun()
      })
    })
  })

  describe('when the owner is provided in the action', () => {
    let owner: string

    beforeEach(() => {
      owner = MOCK_ADDRESS
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
          .provide([[call([ensApi, ensApi.fetchExternalNames], owner), throwError(error)]])
          .put(fetchExternalNamesFailure(ensError, owner))
          .dispatch(fetchExternalNamesRequest(owner))
          .silentRun()
      })
    })

    describe('when fetchENSList returns an array of names', () => {
      it('should dispatch a success action with the owner and the names', async () => {
        await expectSaga(ensSaga, builderClient, ensApi)
          .provide([[call([ensApi, ensApi.fetchExternalNames], owner), ['name1.eth', 'name2.eth']]])
          .put(
            fetchExternalNamesSuccess(owner, [
              {
                subdomain: 'name1.eth',
                nftOwnerAddress: owner,
                name: 'name1.eth',
                content: '',
                ensOwnerAddress: '',
                resolver: '',
                tokenId: ''
              },
              {
                subdomain: 'name2.eth',
                nftOwnerAddress: owner,
                name: 'name2.eth',
                content: '',
                ensOwnerAddress: '',
                resolver: '',
                tokenId: ''
              }
            ])
          )
          .dispatch(fetchExternalNamesRequest(owner))
          .silentRun()
      })
    })
  })
})

describe('when handling the fetch ens world status request', () => {
  let subdomain: string
  let fetchWorldsResult: WorldInfo | null

  describe('when the subdomain provided is a dcl subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.dcl.eth'
    })

    describe('and getENSBySubdomain returns an ens object', () => {
      let getENSBySubdomainResult: ENS

      beforeEach(() => {
        getENSBySubdomainResult = {
          subdomain
        } as ENS
      })

      describe('and fetchWorlds returns null', () => {
        beforeEach(() => {
          fetchWorldsResult = null
        })

        it('should put an action signaling the success of the fetch ens world status request', async () => {
          await expectSaga(ensSaga, builderClient, ensApi)
            .provide([
              [select(getENSBySubdomain, subdomain), getENSBySubdomainResult],
              [call([content, 'fetchWorld'], subdomain), fetchWorldsResult]
            ])
            .put(
              fetchENSWorldStatusSuccess({
                ...getENSBySubdomainResult,
                worldStatus: null
              })
            )
            .dispatch(fetchENSWorldStatusRequest(subdomain))
            .silentRun()
        })
      })
    })
  })

  describe('when the subdomain provided is an external subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.eth'
    })

    describe('and getExternalNames returns a record with an ens object for the subdomain', () => {
      let getExternalNamesResult: ReturnType<typeof getExternalNames>

      beforeEach(() => {
        getExternalNamesResult = {
          [subdomain]: {
            subdomain
          } as ENS
        }
      })

      describe('and fetchWorlds returns null', () => {
        beforeEach(() => {
          fetchWorldsResult = null
        })

        it('should put an action signaling the success of the fetch ens world status request', async () => {
          await expectSaga(ensSaga, builderClient, ensApi)
            .provide([
              [select(getExternalNames), getExternalNamesResult],
              [call([content, 'fetchWorld'], subdomain), fetchWorldsResult]
            ])
            .put(
              fetchENSWorldStatusSuccess({
                ...getExternalNamesResult[subdomain],
                worldStatus: null
              })
            )
            .dispatch(fetchENSWorldStatusRequest(subdomain))
            .silentRun()
        })
      })
    })

    describe('and getExternalNames returns a record without an ens object for the subdomain', () => {
      let getExternalNamesResult: ReturnType<typeof getExternalNames>

      beforeEach(() => {
        getExternalNamesResult = {}
      })

      describe('and fetchWorlds returns null', () => {
        beforeEach(() => {
          fetchWorldsResult = null
        })

        it('should put an action signaling the failure of the fetch ens world status request', async () => {
          await expectSaga(ensSaga, builderClient, ensApi)
            .provide([
              [select(getExternalNames), getExternalNamesResult],
              [call([content, 'fetchWorld'], subdomain), fetchWorldsResult]
            ])
            .put(
              fetchENSWorldStatusFailure({
                message: `ENS ${subdomain} not found in store`
              })
            )
            .dispatch(fetchENSWorldStatusRequest(subdomain))
            .silentRun()
        })
      })
    })
  })
})

describe('when handling the wallet connection', () => {
  it('should put the action to external names', async () => {
    const address = '0x123'
    await expectSaga(ensSaga, builderClient, ensApi)
      .put(fetchExternalNamesRequest(address))
      .dispatch(connectWalletSuccess({ address } as Wallet))
      .silentRun()
  })
})
