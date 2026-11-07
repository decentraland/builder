import { fetchTransactionSuccess } from 'decentraland-dapps/dist/modules/transaction/actions'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
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
import { getLands } from 'modules/land/selectors'
import { ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { changeToEthereumNetwork } from 'modules/wallet/sagas'
import {
  SET_ENS_RESOLVER_SUCCESS,
  fetchContributableNamesFailure,
  fetchENSRequest,
  fetchENSListRequest,
  fetchENSListSuccess,
  fetchENSSuccess,
  setENSContentRequest,
  setENSContentSuccess,
  setENSContentFailure,
  setENSResolverRequest,
  setENSResolverFailure,
  setENSResolverSuccess,
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
import { addWorldStatusToEachENS, resolveAddress, resolveContenthash, getLandRedirectionHashes } from './utils'
import { Authorization } from 'lib/api/auth'
import { marketplace } from 'lib/api/marketplace'

jest.mock('@dcl/builder-client')
jest.mock('./utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('./utils'),
  resolveAddress: jest.fn(),
  resolveContenthash: jest.fn()
}))

const mockResolveAddress = resolveAddress as jest.MockedFunction<typeof resolveAddress>
const mockResolveContenthash = resolveContenthash as jest.MockedFunction<typeof resolveContenthash>

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
    signer = { getChainId: jest.fn().mockResolvedValue(ChainId.ETHEREUM_SEPOLIA) } as unknown as Signer
    address = '0xtest'
    hash = 'tx-hash'
    currentResolverAddress = ENS_RESOLVER_ADDRESS
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

  describe('and the name uses the verified Sepolia Public Resolver', () => {
    beforeEach(() => {
      currentResolverAddress = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5'
    })

    it('should edit that resolver without replacing it', async () => {
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
        .dispatch(setENSAddressRequest(ens, address))
        .silentRun()
      expect(ENSResolver__factory.connect).toHaveBeenCalledWith(currentResolverAddress, signer)
    })
  })

  describe.each(['0x231b0ee14048e9dccd1d247744d114a4eb5e8e63', '0xf29100983e058b709f3d539b0c765937b804ac15'])(
    'and the signer is on mainnet using %s despite stale wallet state',
    resolver => {
      beforeEach(() => {
        currentResolverAddress = resolver
        jest.mocked(signer.getChainId).mockResolvedValue(ChainId.ETHEREUM_MAINNET)
      })

      it('should edit that resolver without replacing it', async () => {
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
          .put(setENSAddressSuccess(ens, address, ChainId.ETHEREUM_MAINNET, hash))
          .dispatch(setENSAddressRequest(ens, address))
          .silentRun()
        expect(ENSResolver__factory.connect).toHaveBeenCalledWith(currentResolverAddress, signer)
      })
    }
  )

  describe('and the name has an unknown resolver', () => {
    beforeEach(() => {
      currentResolverAddress = '0x00000000000000000000000000000000000000aa'
    })

    it('should reject writes before connecting to the unknown contract', async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([
          [call(changeToEthereumNetwork), undefined],
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
          [call(getSigner), signer],
          [call([ensContract, 'resolver'], namehash(ens.subdomain)), currentResolverAddress]
        ])
        .put(
          setENSAddressFailure(ens, address, {
            message: 'This resolver is not supported for editing. Replace it with the Decentraland resolver first.',
            code: undefined,
            origin: ENSOrigin.ADDRESS
          })
        )
        .dispatch(setENSAddressRequest(ens, address))
        .silentRun()
      expect(ENSResolver__factory.connect).not.toHaveBeenCalled()
    })
  })

  describe('and the name has no resolver set in the ENS registry', () => {
    it('should fail without sending an ineffective transaction', async () => {
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
        .put(
          setENSAddressFailure(ens, address, {
            message: 'Set a resolver before editing ENS records',
            code: undefined,
            origin: ENSOrigin.ADDRESS
          })
        )
        .dispatch(setENSAddressRequest(ens, address))
        .silentRun()

      expect(ENSResolver__factory.connect).not.toHaveBeenCalled()
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
    signer = { getChainId: jest.fn().mockResolvedValue(ChainId.ETHEREUM_SEPOLIA) } as unknown as Signer
    hash = 'tx-hash'
    currentResolverAddress = ENS_RESOLVER_ADDRESS
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
          [call([resolverContract, 'setContenthash'], namehash(ens.subdomain), '0x'), { hash } as ethers.ContractTransaction]
        ])
        .put(setENSContentSuccess(ens, '0x', undefined, 'address', ChainId.ETHEREUM_SEPOLIA, hash))
        .put(closeModal('UnsetENSContentModal'))
        .dispatch(setENSContentRequest(ens))
        .silentRun()

      expect(ENSResolver__factory.connect).toHaveBeenCalledWith(currentResolverAddress, signer)
    })
  })

  describe('and the signer is on mainnet despite stale wallet state', () => {
    beforeEach(() => {
      currentResolverAddress = '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63'
      jest.mocked(signer.getChainId).mockResolvedValue(ChainId.ETHEREUM_MAINNET)
    })

    it('should record the content transaction on the same chain used to validate the resolver', async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([
          [call(changeToEthereumNetwork), undefined],
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
          [call(getSigner), signer],
          [call([ensContract, 'resolver'], namehash(ens.subdomain)), currentResolverAddress],
          [call([resolverContract, 'setContenthash'], namehash(ens.subdomain), '0x'), { hash } as ethers.ContractTransaction]
        ])
        .put(setENSContentSuccess(ens, '0x', undefined, 'address', ChainId.ETHEREUM_MAINNET, hash))
        .dispatch(setENSContentRequest(ens))
        .silentRun()
    })
  })

  describe('and the name has no resolver set in the ENS registry', () => {
    it('should fail without writing content to an unused resolver', async () => {
      await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
        .provide([
          [call(changeToEthereumNetwork), undefined],
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
          [call(getSigner), signer],
          [call([ensContract, 'resolver'], namehash(ens.subdomain)), ethers.constants.AddressZero],
          [call([resolverContract, 'setContenthash'], namehash(ens.subdomain), '0x'), { hash } as ethers.ContractTransaction]
        ])
        .put(
          setENSContentFailure(ens, undefined, {
            message: 'Set a resolver before editing ENS records',
            code: undefined,
            origin: ENSOrigin.CONTENT
          })
        )
        .dispatch(setENSContentRequest(ens))
        .silentRun()

      expect(ENSResolver__factory.connect).not.toHaveBeenCalled()
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
  let currentResolver: string
  let landHashes: { id: string; hash: string }[]
  let landLookupError: Error | undefined

  beforeEach(() => {
    currentResolver = ethers.constants.AddressZero
    landHashes = []
    landLookupError = undefined
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
    mockResolveContenthash.mockReset()
  })

  function runFetchENSSaga() {
    return expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [call(getWallet), { address: walletAddress }],
        [call(getChainIdByNetwork, Network.ETHEREUM), ChainId.ETHEREUM_SEPOLIA],
        [call(getNetworkProvider, ChainId.ETHEREUM_SEPOLIA), { request: jest.fn().mockResolvedValue('0xaa36a7') }],
        [call([ensContract, 'resolver'], namehash(subdomain)), currentResolver],
        [call([ensContract, 'owner'], namehash(subdomain)), walletAddress],
        [call([dclRegistrarContract, 'getTokenId'], name), tokenId],
        [call([dclRegistrarContract, 'ownerOf'], tokenId), walletAddress],
        [select(getLands), []],
        [call(getLandRedirectionHashes, builderClient, []), landLookupError ? throwError(landLookupError) : landHashes]
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
      resolver: currentResolver,
      content: '0x',
      ensAddressRecord
    }
  }

  describe('and the name has a custom registry resolver', () => {
    beforeEach(() => {
      currentResolver = '0x00000000000000000000000000000000000000aa'
      mockResolveAddress.mockResolvedValue(undefined)
      mockResolveContenthash.mockResolvedValue('0xe301')
    })

    it('should preserve the resolver identity and the resolved content', () => {
      return runFetchENSSaga()
        .put(fetchENSSuccess({ ...buildExpectedENS(''), content: '0xe301', landId: '' }))
        .silentRun()
    })
  })

  describe('and a parent resolver supplies content without a direct registry resolver', () => {
    beforeEach(() => {
      mockResolveAddress.mockResolvedValue(undefined)
      mockResolveContenthash.mockResolvedValue('0xe301')
    })

    it('should preserve the content resolved through the parent', () => {
      return runFetchENSSaga()
        .put(fetchENSSuccess({ ...buildExpectedENS(''), content: '0xe301' }))
        .silentRun()
    })

    describe('and the inherited content matches a LAND redirect', () => {
      beforeEach(() => {
        landHashes = [{ id: 'inherited-land', hash: '0xe301' }]
      })

      it('should associate the inherited content with the LAND', () => {
        return runFetchENSSaga()
          .put(fetchENSSuccess({ ...buildExpectedENS(''), content: '0xe301', landId: 'inherited-land' }))
          .silentRun()
      })
    })

    describe('and the Builder API cannot load LAND redirects', () => {
      beforeEach(() => {
        landLookupError = new Error('Builder unavailable')
        jest.spyOn(console, 'error').mockImplementation(() => undefined)
      })

      it('should preserve ENS records without a LAND association', () => {
        return runFetchENSSaga()
          .put(fetchENSSuccess({ ...buildExpectedENS(''), content: '0xe301' }))
          .silentRun()
      })
    })
  })

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

  describe('and the contenthash lookup fails', () => {
    beforeEach(() => {
      mockResolveAddress.mockResolvedValue('0x000000000000000000000000000000000000000C')
      mockResolveContenthash.mockRejectedValue(new Error('Content profile unavailable'))
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    it('should load the name and address even without a direct registry resolver', () => {
      return runFetchENSSaga()
        .put(fetchENSSuccess({ ...buildExpectedENS('0x000000000000000000000000000000000000000C'), contentLookupFailed: true }))
        .silentRun()
    })

    describe('and a resolver is configured directly', () => {
      beforeEach(() => {
        currentResolver = ENS_RESOLVER_ADDRESS
      })

      it('should preserve the resolver and allow address editing', () => {
        return runFetchENSSaga()
          .put(
            fetchENSSuccess({ ...buildExpectedENS('0x000000000000000000000000000000000000000C'), landId: '', contentLookupFailed: true })
          )
          .silentRun()
      })
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
        .put(fetchENSSuccess({ ...buildExpectedENS(''), addressLookupFailed: true }))
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

describe('when setting the default resolver after a custom resolver was installed', () => {
  let signer: Signer
  let ens: ENS
  let ensContract: ENSContract
  let setResolver: jest.Mock

  beforeEach(() => {
    signer = { getChainId: jest.fn().mockResolvedValue(ChainId.ETHEREUM_SEPOLIA) } as unknown as Signer
    ens = { name: 'test', subdomain: 'test.dcl.eth' } as ENS
    setResolver = jest.fn()
    ensContract = { resolver: jest.fn(), setResolver } as unknown as ENSContract
    jest.spyOn(ENS__factory, 'connect').mockReturnValue(ensContract)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should reject the stale request without replacing the current resolver', async () => {
    await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [call(changeToEthereumNetwork), undefined],
        [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
        [call(getSigner), signer],
        [call(getChainIdByNetwork, Network.ETHEREUM), ChainId.ETHEREUM_SEPOLIA],
        [call(getNetworkProvider, ChainId.ETHEREUM_SEPOLIA), { request: jest.fn().mockResolvedValue('0xaa36a7') }],
        [call([ensContract, 'resolver'], namehash(ens.subdomain)), '0x00000000000000000000000000000000000000aa']
      ])
      .put(
        setENSResolverFailure(ens, {
          message: 'This name already has a resolver. Confirm replacement before changing it.',
          code: undefined,
          origin: ENSOrigin.RESOLVER
        })
      )
      .put(fetchENSRequest(ens.name))
      .dispatch(setENSResolverRequest(ens))
      .silentRun()
    expect(setResolver).not.toHaveBeenCalled()
  })
})

describe('when explicitly confirming replacement of an unsupported resolver', () => {
  let signer: Signer
  let ens: ENS
  let ensContract: ENSContract
  let currentResolver: string
  let setResolver: jest.Mock
  let hash: string
  let miningError: Error | undefined

  beforeEach(() => {
    signer = { getChainId: jest.fn().mockResolvedValue(ChainId.ETHEREUM_SEPOLIA) } as unknown as Signer
    ens = { name: 'test', subdomain: 'test.dcl.eth', resolver: '0x00000000000000000000000000000000000000aa' } as ENS
    currentResolver = ens.resolver
    hash = 'replacement-hash'
    miningError = undefined
    setResolver = jest.fn().mockResolvedValueOnce({ hash })
    ensContract = { resolver: jest.fn(), setResolver } as unknown as ENSContract
    jest.spyOn(ENS__factory, 'connect').mockReturnValue(ensContract)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function runReplacement() {
    return expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [call(changeToEthereumNetwork), undefined],
        [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_SEPOLIA }],
        [call(getSigner), signer],
        [call(waitForTx, hash), miningError ? throwError(miningError) : true],
        [call(getChainIdByNetwork, Network.ETHEREUM), ChainId.ETHEREUM_SEPOLIA],
        [call(getNetworkProvider, ChainId.ETHEREUM_SEPOLIA), { request: jest.fn().mockResolvedValue('0xaa36a7') }],
        [call([ensContract, 'resolver'], namehash(ens.subdomain)), currentResolver]
      ])
      .dispatch(setENSResolverRequest(ens, ens.resolver))
  }

  it('should replace the resolver that the user confirmed', async () => {
    await runReplacement()
      .put(setENSResolverSuccess(ens, ENS_RESOLVER_ADDRESS, 'address', ChainId.ETHEREUM_SEPOLIA, hash))
      .not.put(fetchENSRequest(ens.name))
      .silentRun()
    expect(setResolver).toHaveBeenCalledWith(namehash(ens.subdomain), ENS_RESOLVER_ADDRESS)
  })

  describe('and the transaction fails after submission', () => {
    beforeEach(() => {
      miningError = new Error('Transaction reverted')
    })

    it('should report failure and refresh the actual resolver state', () => {
      return runReplacement()
        .put(setENSResolverFailure(ens, { message: 'Transaction reverted', code: undefined, origin: ENSOrigin.RESOLVER }))
        .put(fetchENSRequest(ens.name))
        .silentRun()
    })
  })

  describe('and the resolver changed after confirmation', () => {
    beforeEach(() => {
      currentResolver = '0x00000000000000000000000000000000000000bb'
    })

    it('should reject the stale confirmation without sending a transaction', async () => {
      await runReplacement()
        .put(
          setENSResolverFailure(ens, {
            message: 'The resolver changed after confirmation. Refresh the name and try again.',
            code: undefined,
            origin: ENSOrigin.RESOLVER
          })
        )
        .put(fetchENSRequest(ens.name))
        .silentRun()
      expect(setResolver).not.toHaveBeenCalled()
    })
  })
})

describe.each([
  { addressFails: true, contentFails: false },
  { addressFails: false, contentFails: true },
  { addressFails: true, contentFails: true }
])('when list record lookups fail (address: $addressFails, content: $contentFails)', ({ addressFails, contentFails }) => {
  let ensContract: ENSContract
  let registrar: DCLRegistrar
  let expected: ENS

  beforeEach(() => {
    ensContract = {
      resolver: jest.fn().mockResolvedValue(ethers.constants.AddressZero),
      owner: jest.fn().mockResolvedValue('owner')
    } as unknown as ENSContract
    registrar = {
      getTokenId: jest.fn().mockResolvedValue(ethers.BigNumber.from(1)),
      ownerOf: jest.fn().mockResolvedValue('owner')
    } as unknown as DCLRegistrar
    jest.spyOn(ENS__factory, 'connect').mockReturnValue(ensContract)
    jest.spyOn(DCLRegistrar__factory, 'connect').mockReturnValue(registrar)
    jest.spyOn(worldsAPIContent, 'fetchWorld').mockResolvedValue(null)
    if (addressFails) mockResolveAddress.mockRejectedValueOnce(new Error('address unavailable'))
    else mockResolveAddress.mockResolvedValueOnce('0x0000000000000000000000000000000000000011')
    if (contentFails) mockResolveContenthash.mockRejectedValueOnce(new Error('content unavailable'))
    else mockResolveContenthash.mockResolvedValueOnce('0x1234')
    expected = {
      name: 'test',
      subdomain: 'test.dcl.eth',
      tokenId: '1',
      ensOwnerAddress: 'owner',
      nftOwnerAddress: 'owner',
      resolver: ethers.constants.AddressZero,
      content: contentFails ? '0x' : '0x1234',
      ensAddressRecord: addressFails ? '' : '0x0000000000000000000000000000000000000011',
      landId: undefined,
      worldStatus: null,
      ...(addressFails ? { addressLookupFailed: true } : {}),
      ...(contentFails ? { contentLookupFailed: true } : {})
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockResolveAddress.mockReset()
    mockResolveContenthash.mockReset()
  })

  it('should preserve successful records and mark only failed lookups as unknown', async () => {
    await expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide([
        [select(getLands), []],
        [call(getLandRedirectionHashes, builderClient, []), []],
        [call(getWallet), { address: 'owner' }],
        [call(getChainIdByNetwork, Network.ETHEREUM), ChainId.ETHEREUM_SEPOLIA],
        [call(getNetworkProvider, ChainId.ETHEREUM_SEPOLIA), { request: jest.fn().mockResolvedValue('0xaa36a7') }],
        [call([marketplace, 'fetchENSList'], 'owner', 1, 0), ['test']],
        [call([marketplace, 'fetchENSListCount'], 'owner'), 1],
        [call([lists, 'fetchBannedNames']), []]
      ])
      .put(fetchENSListSuccess([expected], 1))
      .dispatch(fetchENSListRequest(1, 0))
      .silentRun()
  })
})

describe('when a persisted resolver transaction completes after reload', () => {
  let transaction: Transaction
  beforeEach(() => {
    transaction = { actionType: SET_ENS_RESOLVER_SUCCESS, payload: { ens: { name: 'test' } } } as Transaction
  })
  it('should request fresh effective records without the original write saga', () => {
    return expectSaga(ensSaga, builderClient, ensApi, worldsAPIContent)
      .provide({
        put(effect, next) {
          return effect.action.type === fetchENSRequest('test').type ? undefined : next()
        }
      })
      .put(fetchENSRequest('test'))
      .dispatch(fetchTransactionSuccess(transaction))
      .silentRun()
  })
})
