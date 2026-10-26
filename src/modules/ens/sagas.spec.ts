import { throwError } from 'redux-saga-test-plan/providers'
import { expectSaga } from 'redux-saga-test-plan'
import { namehash } from '@ethersproject/hash'
import { call, select } from 'redux-saga/effects'
import { Signer, ethers } from 'ethers'
import { BuilderClient } from '@dcl/builder-client'
import { ChainId, Network } from '@dcl/schemas'
import { ENSResolver__factory, ENSResolver, ENS__factory, ENS as ENSContract, DCLRegistrar__factory, DCLRegistrar } from 'contracts'
import { getSigner, getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { connectWalletSuccess } from 'decentraland-dapps/dist/modules/wallet/actions'
import { waitForTx } from 'decentraland-dapps/dist/modules/transaction/utils'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { fetchWorldDeploymentsRequest } from 'modules/deployment/actions'
import { lists } from 'lib/api/lists'
import { WorldInfo, WorldsAPI } from 'lib/api/worlds'
import { ENSApi } from 'lib/api/ens'
import { getWallet } from 'modules/wallet/utils'
import { changeToEthereumNetwork } from 'modules/wallet/sagas'
import { ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import {
  fetchContributableNamesFailure,
  fetchENSRequest,
  fetchENSSuccess,
  setENSContentRequest,
  setENSContentSuccess,
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
import { addWorldStatusToEachENS, resolveAddress } from './utils'
import { Authorization } from 'lib/api/auth'
import { marketplace } from 'lib/api/marketplace'

jest.mock('@dcl/builder-client')
jest.mock('./utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('./utils'),
  resolveAddress: jest.fn()
}))

const mockResolveAddress = resolveAddress as jest.MockedFunction<typeof resolveAddress>

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
  let ensContract: ENSContract
  let currentResolverAddress: string

  beforeEach(() => {
    ens = {
      subdomain: 'test.dcl.eth',
      name: 'test'
    } as ENS
    signer = {} as Signer
    address = '0xtest'
    hash = 'tx-hash'
    currentResolverAddress = '0x00000000000000000000000000000000000000Aa'
    ensContract = { resolver: jest.fn() } as unknown as ENSContract
    jest.spyOn(ENS__factory, 'connect').mockReturnValue(ensContract)
    jest.spyOn(ENSResolver__factory, 'connect').mockReturnValue(ensResolverContract)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('and the name has a resolver set in the ENS registry', () => {
    it("should set the address on the name's current resolver", async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([
          [call(changeToEthereumNetwork), undefined],
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
          [call(getSigner), signer],
          [call([ensContract, 'resolver'], namehash(ens.subdomain)), currentResolverAddress],
          [
            call([ensResolverContract, 'setAddr(bytes32,address)'], namehash(ens.subdomain), address),
            { hash } as ethers.ContractTransaction
          ],
          [call(waitForTx, hash), true]
        ])
        .put(setENSAddressSuccess(ens, address, ChainId.ETHEREUM_SEPOLIA, hash))
        .put(closeModal('EnsMapAddressModal'))
        .dispatch(setENSAddressRequest(ens, address))
        .silentRun()

      expect(ENSResolver__factory.connect).toHaveBeenCalledWith(currentResolverAddress, signer)
    })
  })

  describe('and the name has no resolver set in the ENS registry', () => {
    it('should set the address on the default resolver', async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([
          [call(changeToEthereumNetwork), undefined],
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
          [call(getSigner), signer],
          [call([ensContract, 'resolver'], namehash(ens.subdomain)), ethers.constants.AddressZero],
          [
            call([ensResolverContract, 'setAddr(bytes32,address)'], namehash(ens.subdomain), address),
            { hash } as ethers.ContractTransaction
          ],
          [call(waitForTx, hash), true]
        ])
        .put(setENSAddressSuccess(ens, address, ChainId.ETHEREUM_SEPOLIA, hash))
        .dispatch(setENSAddressRequest(ens, address))
        .silentRun()

      expect(ENSResolver__factory.connect).toHaveBeenCalledWith(ENS_RESOLVER_ADDRESS, signer)
    })
  })

  it('should put the failure action when something goes wrong', () => {
    const error = { message: 'an error message', code: 1, name: 'error' }
    return expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [call(changeToEthereumNetwork), undefined],
        [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
        [call(getSigner), signer],
        [call([ensContract, 'resolver'], namehash(ens.subdomain)), currentResolverAddress],
        [call([ensResolverContract, 'setAddr(bytes32,address)'], namehash(ens.subdomain), address), throwError(error)],
        [call(waitForTx, hash), true]
      ])
      .put(setENSAddressFailure(ens, address, { message: error.message, code: error.code, origin: ENSOrigin.ADDRESS }))
      .dispatch(setENSAddressRequest(ens, address))
      .silentRun()
  })
})

describe('when handling the set ens content request to unset the content', () => {
  let signer: Signer
  let ens: ENS
  let hash: string
  let ensContract: ENSContract
  let resolverContract: ENSResolver
  let currentResolverAddress: string

  beforeEach(() => {
    ens = {
      subdomain: 'test.dcl.eth',
      name: 'test'
    } as ENS
    signer = {} as Signer
    hash = 'tx-hash'
    currentResolverAddress = '0x00000000000000000000000000000000000000Aa'
    ensContract = { resolver: jest.fn() } as unknown as ENSContract
    resolverContract = { setContenthash: jest.fn() } as unknown as ENSResolver
    jest.spyOn(ENS__factory, 'connect').mockReturnValue(ensContract)
    jest.spyOn(ENSResolver__factory, 'connect').mockReturnValue(resolverContract)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('and the name has a resolver set in the ENS registry', () => {
    it("should clear the content on the name's current resolver", async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([
          [call(changeToEthereumNetwork), undefined],
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
          [call(getSigner), signer],
          [call([ensContract, 'resolver'], namehash(ens.subdomain)), currentResolverAddress],
          [
            call([resolverContract, 'setContenthash'], namehash(ens.subdomain), ethers.constants.AddressZero),
            { hash } as ethers.ContractTransaction
          ]
        ])
        .put(setENSContentSuccess(ens, ethers.constants.AddressZero, undefined, 'address', ChainId.ETHEREUM_SEPOLIA, hash))
        .put(closeModal('UnsetENSContentModal'))
        .dispatch(setENSContentRequest(ens))
        .silentRun()

      expect(ENSResolver__factory.connect).toHaveBeenCalledWith(currentResolverAddress, signer)
    })
  })

  describe('and the name has no resolver set in the ENS registry', () => {
    it('should clear the content on the default resolver', async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([
          [call(changeToEthereumNetwork), undefined],
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
          [call(getSigner), signer],
          [call([ensContract, 'resolver'], namehash(ens.subdomain)), ethers.constants.AddressZero],
          [
            call([resolverContract, 'setContenthash'], namehash(ens.subdomain), ethers.constants.AddressZero),
            { hash } as ethers.ContractTransaction
          ]
        ])
        .put(setENSContentSuccess(ens, ethers.constants.AddressZero, undefined, 'address', ChainId.ETHEREUM_SEPOLIA, hash))
        .dispatch(setENSContentRequest(ens))
        .silentRun()

      expect(ENSResolver__factory.connect).toHaveBeenCalledWith(ENS_RESOLVER_ADDRESS, signer)
    })
  })
})

describe('when handling the fetch ens request', () => {
  const name = 'test'
  const subdomain = 'test.dcl.eth'
  const walletAddress = '0x00000000000000000000000000000000000000bb'
  let ensContract: ENSContract
  let dclRegistrarContract: DCLRegistrar
  let tokenId: ethers.BigNumber

  beforeEach(() => {
    tokenId = ethers.BigNumber.from(1)
    ensContract = { resolver: jest.fn(), owner: jest.fn() } as unknown as ENSContract
    dclRegistrarContract = { getTokenId: jest.fn(), ownerOf: jest.fn() } as unknown as DCLRegistrar
    jest.spyOn(ENS__factory, 'connect').mockReturnValue(ensContract)
    jest.spyOn(DCLRegistrar__factory, 'connect').mockReturnValue(dclRegistrarContract)
    jest.spyOn(ENSResolver__factory, 'connect')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockResolveAddress.mockReset()
  })

  function runFetchENSSaga() {
    return expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [call(getWallet), { address: walletAddress }],
        [call(getChainIdByNetwork, Network.ETHEREUM), ChainId.ETHEREUM_SEPOLIA],
        [call(getNetworkProvider, ChainId.ETHEREUM_SEPOLIA), { request: jest.fn().mockResolvedValue('0xaa36a7') }],
        [call([ensContract, 'resolver'], namehash(subdomain)), ethers.constants.AddressZero],
        [call([ensContract, 'owner'], namehash(subdomain)), walletAddress],
        [call([dclRegistrarContract, 'getTokenId'], name), tokenId],
        [call([dclRegistrarContract, 'ownerOf'], tokenId), walletAddress]
      ])
      .dispatch(fetchENSRequest(name))
  }

  function buildExpectedENS(ensAddressRecord: string): ENS {
    return {
      name,
      tokenId: tokenId.toString(),
      ensOwnerAddress: walletAddress,
      nftOwnerAddress: walletAddress,
      subdomain,
      resolver: ethers.constants.AddressZero,
      content: ethers.constants.AddressZero,
      ensAddressRecord
    }
  }

  describe("and the name's current resolver has an address for it", () => {
    beforeEach(() => {
      mockResolveAddress.mockResolvedValue('0x000000000000000000000000000000000000000C')
    })

    it('should resolve the address record through the current resolver of the name', async () => {
      await runFetchENSSaga()
        .put(fetchENSSuccess(buildExpectedENS('0x000000000000000000000000000000000000000C')))
        .silentRun()

      expect(mockResolveAddress).toHaveBeenCalledWith(expect.any(ethers.providers.Web3Provider), subdomain)
      expect(ENSResolver__factory.connect).not.toHaveBeenCalled()
    })
  })

  describe('and the name has no address record', () => {
    beforeEach(() => {
      mockResolveAddress.mockResolvedValue(undefined)
    })

    it('should put the success action with an empty address record', () => {
      return runFetchENSSaga()
        .put(fetchENSSuccess(buildExpectedENS('')))
        .silentRun()
    })
  })

  describe('and resolving the address record fails', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      mockResolveAddress.mockRejectedValue(new Error('RPC unavailable'))
    })

    it('should put the success action with an empty address record', () => {
      return runFetchENSSaga()
        .put(fetchENSSuccess(buildExpectedENS('')))
        .silentRun()
    })
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
