import { throwError } from 'redux-saga-test-plan/providers'
import { expectSaga } from 'redux-saga-test-plan'
import { namehash } from '@ethersproject/hash'
import { call, select } from 'redux-saga/effects'
import { Signer, ethers } from 'ethers'
import { BuilderClient } from '@dcl/builder-client'
import { ChainId } from '@dcl/schemas'
import { ENSResolver__factory, ENSResolver } from 'contracts'
import { getSigner } from 'decentraland-dapps/dist/lib/eth'
import { connectWalletSuccess } from 'decentraland-dapps/dist/modules/wallet/actions'
import { waitForTx } from 'decentraland-dapps/dist/modules/transaction/utils'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { fetchWorldDeploymentsRequest } from 'modules/deployment/actions'
import { lists } from 'lib/api/lists'
import { WorldInfo, WorldsAPI } from 'lib/api/worlds'
import { ENSApi } from 'lib/api/ens'
import { getWallet } from 'modules/wallet/utils'
import {
  fetchContributableNamesFailure,
  fetchContributableNamesRequest,
  fetchContributableNamesSuccess,
  fetchENSWorldStatusFailure,
  fetchENSWorldStatusRequest,
  fetchENSWorldStatusSuccess,
  fetchExternalNamesFailure,
  fetchExternalNamesRequest,
  fetchExternalNamesSuccess,
  setENSAddressFailure,
  setENSAddressRequest,
  setENSAddressSuccess
} from './actions'
import { ensSaga } from './sagas'
import { ContributableDomain, ENS, ENSError, ENSOrigin, WorldStatus } from './types'
import { getContributableNamesList, getENSBySubdomain, getExternalNames } from './selectors'
import { addWorldStatusToEachENS } from './utils'
import { Authorization } from 'lib/api/auth'
import { marketplace } from 'lib/api/marketplace'
import { config } from 'config'

jest.mock('@dcl/builder-client')

const MockBuilderClient = BuilderClient as jest.MockedClass<typeof BuilderClient>
const MockWorldsAPI = WorldsAPI as jest.MockedClass<typeof WorldsAPI>
const mockAuthorization: Authorization = new Authorization(() => 'mockAddress')

let builderClient: BuilderClient
let ensApi: ENSApi
let ensResolverContract: ENSResolver
let worldsAPIContent: WorldsAPI

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

  ensResolverContract = {
    'setAddr(bytes32,address)': jest.fn().mockResolvedValue(''),
    'addr(bytes32)': jest.fn().mockResolvedValue('0xaddr')
  } as unknown as ENSResolver

  worldsAPIContent = new MockWorldsAPI(mockAuthorization)
})

describe('when handling the fetching of external ens names for an owner', () => {
  describe('when an owner is provided in the action', () => {
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
        await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
          .provide([[call([ensApi, ensApi.fetchExternalNames], owner), throwError(error)]])
          .put(fetchExternalNamesFailure(owner, ensError))
          .dispatch(fetchExternalNamesRequest(owner))
          .silentRun()
      })
    })

    describe('when fetchENSList returns an array of names', () => {
      let names: string[]

      beforeEach(() => {
        names = ['name1.eth', 'name2.eth', 'name2.subdomain.eth']
      })

      describe('when fetchBannedNames returns an array of banned names', () => {
        let bannedNames: string[]

        beforeEach(() => {
          bannedNames = ['NAME2']
        })

        it('should dispatch a request action to fetch world deployments for unbanned names and a success action for fetching external names with the owner and a list of unbanned ENSs with their world status', async () => {
          const enss: ENS[] = [
            {
              subdomain: 'name1.eth',
              nftOwnerAddress: owner,
              name: 'name1.eth',
              content: '',
              ensOwnerAddress: '',
              resolver: '',
              tokenId: ''
            }
          ]

          const enssWithWorldStatus: ENS[] = enss.map(ens => ({
            ...ens,
            worldStatus: {} as WorldStatus
          }))

          await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
            .provide([
              [call([ensApi, ensApi.fetchExternalNames], owner), names],
              [call([lists, lists.fetchBannedNames]), bannedNames],
              [call(addWorldStatusToEachENS, enss), enssWithWorldStatus]
            ])
            .put(fetchWorldDeploymentsRequest(['name1.eth']))
            .put(fetchExternalNamesSuccess(owner, enssWithWorldStatus))
            .dispatch(fetchExternalNamesRequest(owner))
            .silentRun()
        })
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
          await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
            .provide([
              [select(getENSBySubdomain, subdomain), getENSBySubdomainResult],
              [select(getContributableNamesList), []],
              [call([worldsAPIContent, 'fetchWorld'], subdomain), fetchWorldsResult]
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
          await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
            .provide([
              [select(getExternalNames), getExternalNamesResult],
              [select(getContributableNamesList), []],
              [call([worldsAPIContent, 'fetchWorld'], subdomain), fetchWorldsResult]
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
          await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
            .provide([
              [select(getExternalNames), getExternalNamesResult],
              [select(getContributableNamesList), []],
              [call([worldsAPIContent, 'fetchWorld'], subdomain), fetchWorldsResult]
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
  it('should put the request action to fetch external names', async () => {
    const address = '0x123'
    await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .put(fetchExternalNamesRequest(address))
      .dispatch(connectWalletSuccess({ address } as Wallet))
      .silentRun()
  })
})

describe('when handling the set ens address request', () => {
  let signer: Signer
  let address: string
  let ens: ENS
  let hash: string

  beforeEach(() => {
    ens = {
      subdomain: 'test.dcl.eth',
      name: 'test'
    } as ENS
    signer = {} as Signer
    address = '0xtest'
    hash = 'tx-hash'
    ENSResolver__factory.connect = jest.fn().mockReturnValue(ensResolverContract)
    config.get = jest.fn().mockReturnValueOnce(ChainId.ETHEREUM_GOERLI)
  })

  it('should call resolver contract with the ens domain and address', () => {
    return expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_GOERLI }],
        [call(getSigner), { signer }],
        [call([ensResolverContract, 'setAddr(bytes32,address)'], namehash(ens.subdomain), address), { hash } as ethers.ContractTransaction],
        [call(waitForTx, hash), true]
      ])
      .put(setENSAddressSuccess(ens, address, ChainId.ETHEREUM_GOERLI, hash))
      .put(closeModal('EnsMapAddressModal'))
      .dispatch(setENSAddressRequest(ens, address))
      .silentRun()
  })

  it('should put the failure action when something goes wrong', () => {
    const error = { message: 'an error message', code: 1, name: 'error' }
    return expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_GOERLI }],
        [call(getSigner), { signer }],
        [call([ensResolverContract, 'setAddr(bytes32,address)'], namehash(ens.subdomain), address), throwError(error)],
        [call(waitForTx, hash), true]
      ])
      .put(setENSAddressFailure(ens, address, { message: error.message, code: error.code, origin: ENSOrigin.ADDRESS }))
      .dispatch(setENSAddressRequest(ens, address))
      .silentRun()
  })
})

describe('when handling the fetching of contributable names', () => {
  describe('when fetchContributableDomains throws an error', () => {
    let ensError: ENSError
    let error: Error

    beforeEach(() => {
      error = new Error('Some Error')
      ensError = { message: error.message }
    })

    it('should dispatch an error action with the error', async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([[call([worldsAPIContent, 'fetchContributableDomains']), throwError(error)]])
        .put(fetchContributableNamesFailure(ensError))
        .dispatch(fetchContributableNamesRequest())
        .silentRun()
    })
  })

  describe('when fetchContributableDomains returns a list of contributable names', () => {
    let contributableName: ContributableDomain
    let names: ENS[]
    let namesWithWorldStatus: ENS[]

    beforeEach(() => {
      contributableName = { name: 'test.dcl.eth', size: '120', owner: '0x123', user_permissions: ['deployment'] }
      names = [
        {
          name: contributableName.name,
          subdomain: contributableName.name,
          nftOwnerAddress: contributableName.owner,
          content: '',
          ensOwnerAddress: '',
          resolver: '',
          tokenId: '',
          userPermissions: contributableName.user_permissions,
          size: contributableName.size
        }
      ]

      namesWithWorldStatus = [{ ...names[0], worldStatus: { healthy: true, scene: { urn: 'urn', entityId: 'id' } } }]
    })

    describe('and there are no banned names', () => {
      it('should dispatch a success action with the contributable names', async () => {
        await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
          .provide([
            [call([worldsAPIContent, 'fetchContributableDomains']), [contributableName]],
            [call([lists, 'fetchBannedNames']), []],
            [call([marketplace, 'fetchENSOwnerByDomain'], ['test']), { test: '0x123' }],
            [call([ensApi, 'fetchExternalENSOwners'], []), {}],
            [call(addWorldStatusToEachENS, names), namesWithWorldStatus]
          ])
          .put(fetchWorldDeploymentsRequest(['test.dcl.eth']))
          .put(fetchContributableNamesSuccess(namesWithWorldStatus))
          .dispatch(fetchContributableNamesRequest())
          .silentRun()
      })
    })

    describe('and fetching the names owners throws an error', () => {
      let ensError: ENSError
      let error: Error

      beforeEach(() => {
        error = new Error('Some Error')
        ensError = { message: error.message }
      })

      it('should dispatch an error action with the error', async () => {
        await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
          .provide([
            [call([worldsAPIContent, 'fetchContributableDomains']), [contributableName]],
            [call([lists, 'fetchBannedNames']), []],
            [call([marketplace, 'fetchENSOwnerByDomain'], ['test']), throwError(error)],
            [call([ensApi, 'fetchExternalENSOwners'], []), {}]
          ])
          .put(fetchContributableNamesFailure(ensError))
          .dispatch(fetchContributableNamesRequest())
          .silentRun()
      })
    })

    describe('and fetching the external ens owners throws an error', () => {
      let ensError: ENSError
      let error: Error

      beforeEach(() => {
        error = new Error('Some Error')
        ensError = { message: error.message }
      })

      it('should dispatch an error action with the error', async () => {
        await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
          .provide([
            [call([worldsAPIContent, 'fetchContributableDomains']), [contributableName]],
            [call([lists, 'fetchBannedNames']), []],
            [call([marketplace, 'fetchENSOwnerByDomain'], ['test']), { test: '0x123' }],
            [call([ensApi, 'fetchExternalENSOwners'], []), throwError(error)]
          ])
          .put(fetchContributableNamesFailure(ensError))
          .dispatch(fetchContributableNamesRequest())
          .silentRun()
      })
    })
  })
})
