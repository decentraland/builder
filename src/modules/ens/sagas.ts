import { BigNumber, ethers } from 'ethers'
import { namehash } from '@ethersproject/hash'
import PQueue from 'p-queue'
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { ChainId, Network } from '@dcl/schemas'
import { BuilderClient, LandHashes } from '@dcl/builder-client'
import { ContractName, getContract } from 'decentraland-transactions'
import { getChainIdByNetwork, getNetworkProvider, getSigner } from 'decentraland-dapps/dist/lib/eth'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { CONNECT_WALLET_SUCCESS, ConnectWalletSuccessAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { getCurrentLocale } from 'decentraland-dapps/dist/modules/translation/utils'
import { waitForTx } from 'decentraland-dapps/dist/modules/transaction/utils'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { DCLController } from 'contracts'
import { ENS__factory } from 'contracts/factories/ENS__factory'
import { ENSResolver__factory } from 'contracts/factories/ENSResolver__factory'
import { DCLRegistrar__factory } from 'contracts/factories/DCLRegistrar__factory'
import { DCLController__factory } from 'contracts/factories/DCLController__factory'
import { ERC20__factory } from 'contracts/factories/ERC20__factory'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS, CONTROLLER_V2_ADDRESS, MANA_ADDRESS, REGISTRAR_ADDRESS } from 'modules/common/contracts'
import { getWallet } from 'modules/wallet/utils'
import { getCenter, getSelection } from 'modules/land/utils'
import { fetchWorldDeploymentsRequest } from 'modules/deployment/actions'
import { getLands } from 'modules/land/selectors'
import { FETCH_LANDS_SUCCESS } from 'modules/land/actions'
import { Land } from 'modules/land/types'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { marketplace } from 'lib/api/marketplace'
import { lists } from 'lib/api/lists'
import { WorldInfo, content as WorldsAPIContent } from 'lib/api/worlds'
import { extractEntityId } from 'lib/urn'
import { isErrorWithCode } from 'lib/error'
import { ENSApi } from 'lib/api/ens'
import {
  FETCH_ENS_REQUEST,
  FetchENSRequestAction,
  fetchENSSuccess,
  fetchENSFailure,
  SET_ENS_CONTENT_REQUEST,
  SetENSContentRequestAction,
  setENSContentSuccess,
  setENSContentFailure,
  SET_ENS_RESOLVER_REQUEST,
  SetENSResolverRequestAction,
  setENSResolverSuccess,
  setENSResolverFailure,
  FETCH_ENS_AUTHORIZATION_REQUEST,
  FetchENSAuthorizationRequestAction,
  fetchENSAuthorizationRequest,
  fetchENSAuthorizationSuccess,
  fetchENSAuthorizationFailure,
  FETCH_ENS_LIST_REQUEST,
  FetchENSListRequestAction,
  fetchENSListRequest,
  fetchENSListSuccess,
  fetchENSListFailure,
  CLAIM_NAME_REQUEST,
  ClaimNameRequestAction,
  claimNameSuccess,
  claimNameFailure,
  ALLOW_CLAIM_MANA_REQUEST,
  AllowClaimManaRequestAction,
  allowClaimManaSuccess,
  allowClaimManaFailure,
  ReclaimNameRequestAction,
  reclaimNameSuccess,
  reclaimNameFailure,
  RECLAIM_NAME_REQUEST,
  claimNameTransactionSubmitted,
  FETCH_ENS_WORLD_STATUS_REQUEST,
  FetchENSWorldStatusRequestAction,
  fetchENSWorldStatusSuccess,
  fetchENSWorldStatusFailure,
  FETCH_EXTERNAL_NAMES_REQUEST,
  FetchExternalNamesRequestAction,
  fetchExternalNamesSuccess,
  fetchExternalNamesFailure,
  fetchExternalNamesRequest,
  SetENSAddressRequestAction,
  setENSAddressSuccess,
  setENSAddressFailure,
  SET_ENS_ADDRESS_REQUEST
} from './actions'
import { getENSBySubdomain, getExternalNames } from './selectors'
import { ENS, ENSOrigin, ENSError, Authorization } from './types'
import { addWorldStatusToEachENS, getDomainFromName, getLandRedirectionHashes, isExternalName } from './utils'

export function* ensSaga(builderClient: BuilderClient, ensApi: ENSApi) {
  yield takeLatest(FETCH_LANDS_SUCCESS, handleFetchLandsSuccess)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(FETCH_ENS_WORLD_STATUS_REQUEST, handleFetchENSWorldStatusRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_ENS_AUTHORIZATION_REQUEST, handleFetchAuthorizationRequest)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
  yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
  yield takeEvery(ALLOW_CLAIM_MANA_REQUEST, handleApproveClaimManaRequest)
  yield takeEvery(RECLAIM_NAME_REQUEST, handleReclaimNameRequest)
  yield takeEvery(FETCH_EXTERNAL_NAMES_REQUEST, handleFetchExternalNamesRequest)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWallet)
  yield takeEvery(SET_ENS_ADDRESS_REQUEST, handleSetENSAddressRequest)

  function* handleFetchLandsSuccess() {
    yield put(fetchENSAuthorizationRequest())
    yield put(fetchENSListRequest())
  }

  function* handleFetchENSRequest(action: FetchENSRequestAction) {
    const { name, land } = action.payload
    const subdomain = name.toLowerCase() + '.dcl.eth'
    try {
      const wallet: Wallet = yield call(getWallet)
      const signer: ethers.Signer = yield call(getSigner)
      const address = wallet.address
      const nodehash = namehash(subdomain)
      const ensContract = ENS__factory.connect(ENS_ADDRESS, signer)
      const dclRegistrarContract = DCLRegistrar__factory.connect(REGISTRAR_ADDRESS, signer)
      const [resolverAddress, ownerAddress, nftTokenId]: [string, string, BigNumber] = yield all([
        call([ensContract, 'resolver'], nodehash),
        call([ensContract, 'owner'], nodehash),
        call([dclRegistrarContract, 'getTokenId'], name)
      ])

      const owner = ownerAddress.toLowerCase()
      const tokenId = nftTokenId.toString()
      const ensResolverContract = ENSResolver__factory.connect(ENS_RESOLVER_ADDRESS, signer)
      const resolvedAddress: string = yield call([ensResolverContract, 'addr(bytes32)'], nodehash)
      const ensAddressRecord = resolvedAddress !== ethers.constants.AddressZero ? resolvedAddress : ''

      if (resolverAddress.toString() === ethers.constants.AddressZero) {
        yield put(
          fetchENSSuccess({
            name,
            tokenId,
            ensOwnerAddress: owner,
            nftOwnerAddress: address,
            subdomain,
            resolver: ethers.constants.AddressZero,
            content: ethers.constants.AddressZero,
            ensAddressRecord
          })
        )
        return
      }

      const resolverContract = ENSResolver__factory.connect(resolverAddress, signer)
      const currentContent: string = yield call([resolverContract, 'contenthash'], nodehash)

      if (land) {
        const [x, y] = getCenter(getSelection(land))

        const { ipfsHash, contentHash }: LandHashes = yield call(
          [builderClient, 'createLandRedirectionFile'],
          { x, y },
          getCurrentLocale().locale
        )

        if (currentContent === ethers.constants.AddressZero) {
          yield put(
            fetchENSSuccess({
              name,
              tokenId,
              ensOwnerAddress: owner,
              nftOwnerAddress: address,
              subdomain,
              resolver: resolverAddress.toString(),
              content: ethers.constants.AddressZero,
              ipfsHash,
              ensAddressRecord
            })
          )
          return
        }

        if (`0x${contentHash}` === currentContent) {
          yield put(
            fetchENSSuccess({
              name,
              tokenId,
              ensOwnerAddress: owner,
              nftOwnerAddress: address,
              subdomain,
              resolver: ENS_RESOLVER_ADDRESS,
              content: contentHash,
              ipfsHash,
              landId: land.id,
              ensAddressRecord
            })
          )
          return
        }
      }

      const lands: Land[] = yield select(getLands)
      const redirectionHashes: { id: string; hash: string }[] = yield call(getLandRedirectionHashes, builderClient, lands)
      const redirectionLand = redirectionHashes.find(lh => lh.hash === currentContent)
      yield put(
        fetchENSSuccess({
          name,
          tokenId,
          ensOwnerAddress: owner,
          nftOwnerAddress: address,
          subdomain,
          resolver: ENS_RESOLVER_ADDRESS,
          content: currentContent ?? ethers.constants.AddressZero,
          landId: redirectionLand?.id || '',
          ensAddressRecord
        })
      )
    } catch (error) {
      const ensError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(fetchENSFailure(ensError))
    }
  }

  function* handleFetchENSWorldStatusRequest(action: FetchENSWorldStatusRequestAction) {
    const { subdomain } = action.payload

    try {
      let ens: ENS

      if (!isExternalName(subdomain)) {
        ens = yield select(getENSBySubdomain, subdomain)
      } else {
        const externalNames: ReturnType<typeof getExternalNames> = yield select(getExternalNames)
        const maybeEns: ENS | undefined = externalNames[subdomain]

        if (!maybeEns) {
          throw new Error(`ENS ${subdomain} not found in store`)
        }

        ens = maybeEns
      }

      let worldStatus = null

      try {
        const world: WorldInfo = yield call([WorldsAPIContent, 'fetchWorld'], subdomain)
        if (world) {
          const { healthy, configurations } = world
          const entityId = extractEntityId(configurations.scenesUrn[0])
          worldStatus = {
            healthy,
            scene: {
              urn: configurations.scenesUrn[0],
              entityId
            }
          }
        }
      } catch (error) {
        console.error('Failed to load ens world status', error)
      }

      yield put(
        fetchENSWorldStatusSuccess({
          ...ens,
          worldStatus
        })
      )
    } catch (error) {
      const ensError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(fetchENSWorldStatusFailure(ensError))
    }
  }

  function* handleSetENSResolverRequest(action: SetENSResolverRequestAction) {
    const { ens } = action.payload
    try {
      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const from = wallet.address
      const nodehash = namehash(ens.subdomain)
      const ensContract = ENS__factory.connect(ENS_ADDRESS, signer)

      const transaction: ethers.ContractTransaction = yield call(() => ensContract.setResolver(nodehash, ENS_RESOLVER_ADDRESS))

      yield put(setENSResolverSuccess(ens, ENS_RESOLVER_ADDRESS, from, wallet.chainId, transaction.hash))
    } catch (error) {
      const ensError: ENSError = {
        message: isErrorWithMessage(error) ? error.message : 'Unknown error',
        code: isErrorWithCode(error) ? error.code : undefined,
        origin: ENSOrigin.RESOLVER
      }
      yield put(setENSResolverFailure(ens, ensError))
    }
  }

  function* handleSetENSContentRequest(action: SetENSContentRequestAction) {
    const { ens, land } = action.payload
    try {
      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const from = wallet.address

      let content = ''

      if (land) {
        const [x, y] = getCenter(getSelection(land))

        const { contentHash }: LandHashes = yield call(
          [builderClient, 'createLandRedirectionFile'],
          {
            x,
            y
          },
          getCurrentLocale().locale
        )

        content = `0x${contentHash}`
      } else {
        content = ethers.constants.AddressZero
      }

      const nodehash = namehash(ens.subdomain)
      const resolverContract = ENSResolver__factory.connect(ENS_RESOLVER_ADDRESS, signer)

      const transaction: ethers.ContractTransaction = yield call(() => resolverContract.setContenthash(nodehash, content))
      yield put(setENSContentSuccess(ens, content, land, from.toString(), wallet.chainId, transaction.hash))

      if (!land) {
        yield put(closeModal('UnsetENSContentModal'))
      }
    } catch (error) {
      const ensError: ENSError = {
        message: isErrorWithMessage(error) ? error.message : 'Unknown error',
        code: isErrorWithCode(error) ? error.code : undefined,
        origin: ENSOrigin.CONTENT
      }
      yield put(setENSContentFailure(ens, land, ensError))
    }
  }

  function* handleSetENSAddressRequest(action: SetENSAddressRequestAction) {
    const { ens, address } = action.payload
    try {
      const wallet: Wallet = yield call(getWallet)
      const signer: ethers.Signer = yield call(getSigner)
      const nodehash = namehash(ens.subdomain)
      const resolverContract = ENSResolver__factory.connect(ENS_RESOLVER_ADDRESS, signer)

      const transaction: ethers.ContractTransaction = yield call([resolverContract, 'setAddr(bytes32,address)'], nodehash, address)

      yield put(setENSAddressSuccess(ens, address, wallet.chainId, transaction.hash))
      yield call(waitForTx, transaction.hash)
      yield put(closeModal('EnsMapAddressModal'))
    } catch (error) {
      const ensError: ENSError = {
        message: isErrorWithMessage(error) ? error.message : 'Unknown error',
        code: isErrorWithCode(error) ? error.code : undefined,
        origin: ENSOrigin.ADDRESS
      }
      yield put(setENSAddressFailure(ens, address, ensError))
    }
  }

  function* handleFetchAuthorizationRequest(_action: FetchENSAuthorizationRequestAction) {
    try {
      const from: string = yield select(getAddress)
      const chainId: ChainId = yield call(getChainIdByNetwork, Network.ETHEREUM)
      const contract = getContract(ContractName.MANAToken, chainId)
      const provider: Awaited<ReturnType<typeof getNetworkProvider>> = yield call(getNetworkProvider, chainId)
      const mana = new ethers.Contract(contract.address, contract.abi, new ethers.providers.Web3Provider(provider))
      const allowance: string = yield call(mana.allowance, from, CONTROLLER_V2_ADDRESS)
      const authorization: Authorization = { allowance }

      yield put(fetchENSAuthorizationSuccess(authorization, from.toString()))
    } catch (error) {
      const allowError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(fetchENSAuthorizationFailure(allowError))
    }
  }

  function* fetchBannedDomains() {
    try {
      const bannedDomains: string[] = yield call([lists, 'fetchBannedNames'])
      return bannedDomains
    } catch (error) {
      console.error('Failed to load banned domains', error)
      return []
    }
  }

  function* handleFetchENSListRequest(_action: FetchENSListRequestAction) {
    try {
      const lands: Land[] = yield select(getLands)
      const landHashes: { id: string; hash: string }[] = yield call(getLandRedirectionHashes, builderClient, lands)
      const wallet: Wallet = yield call(getWallet)
      const signer: ethers.Signer = yield call(getSigner)
      const address = wallet.address
      const ensContract: ReturnType<(typeof ENS__factory)['connect']> = yield call([ENS__factory, 'connect'], ENS_ADDRESS, signer)
      const dclRegistrarContract: ReturnType<(typeof DCLRegistrar__factory)['connect']> = yield call(
        [DCLRegistrar__factory, 'connect'],
        REGISTRAR_ADDRESS,
        signer
      )
      let domains: string[] = yield call([marketplace, 'fetchENSList'], address)
      const bannedDomains: string[] = yield call(fetchBannedDomains)
      domains = domains.filter(domain => !bannedDomains.includes(domain))

      const REQUESTS_BATCH_SIZE = 25
      const queue = new PQueue({ concurrency: REQUESTS_BATCH_SIZE })
      const worldsDeployed: string[] = []

      const promisesOfENS: (() => Promise<ENS>)[] = domains.map(data => {
        return async () => {
          const name = data
          const subdomain = `${data.toLowerCase()}.dcl.eth`
          let landId: string | undefined = undefined
          let content = ''
          let worldStatus = null
          let ensAddressRecord = ''

          const nodehash = namehash(subdomain)
          const [resolverAddress, owner, tokenId]: [string, string, string] = await Promise.all([
            ensContract.resolver(nodehash),
            ensContract.owner(nodehash).then(owner => owner.toLowerCase()),
            dclRegistrarContract.getTokenId(name).then(name => name.toString())
          ])
          const resolver = resolverAddress.toString()

          try {
            const resolverContract = ENSResolver__factory.connect(ENS_RESOLVER_ADDRESS, signer)
            const resolvedAddress = await resolverContract['addr(bytes32)'](nodehash)
            ensAddressRecord = resolvedAddress !== ethers.constants.AddressZero ? resolvedAddress : ''
          } catch (e) {
            console.error('Failed to fetch ens address record')
          }

          if (resolver !== ethers.constants.AddressZero) {
            try {
              const resolverContract = ENSResolver__factory.connect(resolverAddress, signer)
              content = await resolverContract.contenthash(nodehash)

              const land = landHashes.find(lh => lh.hash === content)
              if (land) {
                landId = land.id
              }
            } catch (error) {
              console.error('Failed to load ens resolver', error)
            }
          }

          try {
            const world = await WorldsAPIContent.fetchWorld(subdomain)
            if (world) {
              const { healthy, configurations } = world
              const entityId = extractEntityId(configurations.scenesUrn[0])
              worldStatus = {
                healthy,
                scene: {
                  urn: configurations.scenesUrn[0],
                  entityId
                }
              }
              worldsDeployed.push(subdomain)
            }
          } catch (error) {
            console.error('Failed to load ens world status', error)
          }

          const ens: ENS = {
            name,
            tokenId,
            ensOwnerAddress: owner,
            nftOwnerAddress: address,
            subdomain,
            resolver,
            content,
            ensAddressRecord,
            landId,
            worldStatus
          }

          return ens
        }
      })

      const ensList: ENS[] = yield queue.addAll(promisesOfENS)

      if (worldsDeployed.length > 0) {
        yield put(fetchWorldDeploymentsRequest(worldsDeployed))
      }

      yield put(fetchENSListSuccess(ensList))
    } catch (error) {
      const ensError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(fetchENSListFailure(ensError))
    }
  }

  function* handleClaimNameRequest(action: ClaimNameRequestAction) {
    const { name } = action.payload
    try {
      const wallet: Wallet = yield call(getWallet)
      const signer: ethers.Signer = yield call(getSigner)
      const from = wallet.address

      const controllerContract: DCLController = yield call([DCLController__factory, 'connect'], CONTROLLER_V2_ADDRESS, signer)
      const dclRegistrarContract = DCLRegistrar__factory.connect(REGISTRAR_ADDRESS, signer)
      const transaction: ethers.ContractTransaction = yield call([controllerContract, 'register'], name, from)
      yield put(claimNameTransactionSubmitted(name, wallet.address, wallet.chainId, transaction.hash))
      yield call(waitForTx, transaction.hash)
      const tokenId: BigNumber = yield call([dclRegistrarContract, 'getTokenId'], name)
      const ens: ENS = {
        name: name,
        tokenId: tokenId.toString(),
        ensOwnerAddress: wallet.address,
        nftOwnerAddress: wallet.address,
        subdomain: getDomainFromName(name),
        resolver: ethers.constants.AddressZero,
        content: ethers.constants.AddressZero
      }
      yield put(claimNameSuccess(ens, name))
      yield put(closeModal('ClaimNameFatFingerModal'))
    } catch (error) {
      const ensError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(claimNameFailure(ensError))
    }
  }

  function* handleReclaimNameRequest(action: ReclaimNameRequestAction) {
    const { ens } = action.payload
    try {
      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const dclRegistrarContract = DCLRegistrar__factory.connect(REGISTRAR_ADDRESS, signer)
      const transaction: ethers.ContractTransaction = yield call([dclRegistrarContract, 'reclaim'], ens.tokenId, wallet.address)
      yield put(reclaimNameSuccess(transaction.hash, wallet.chainId, { ...ens, ensOwnerAddress: wallet.address }))
      yield put(closeModal('ReclaimNameModal'))
    } catch (error) {
      const ensError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(reclaimNameFailure(ensError))
    }
  }

  function* handleApproveClaimManaRequest(action: AllowClaimManaRequestAction) {
    const { allowance } = action.payload
    try {
      const wallet: Wallet = yield call(getWallet)
      const signer: ethers.Signer = yield call(getSigner)
      const from = wallet.address
      const manaContract: ReturnType<(typeof ERC20__factory)['connect']> = yield call([ERC20__factory, 'connect'], MANA_ADDRESS, signer)
      const transaction: ethers.ContractTransaction = yield call([manaContract, 'approve'], CONTROLLER_V2_ADDRESS, allowance)

      yield put(allowClaimManaSuccess(allowance, from.toString(), wallet.chainId, transaction.hash))
    } catch (error) {
      const ensError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(allowClaimManaFailure(ensError))
    }
  }

  function* handleFetchExternalNamesRequest(action: FetchExternalNamesRequestAction) {
    const { owner } = action.payload

    try {
      let names: string[] = yield call([ensApi, ensApi.fetchExternalNames], owner)

      const bannedNames: string[] = yield call([lists, 'fetchBannedNames'])
      const bannedNamesSet = new Set(bannedNames.map(x => x.toLowerCase()))

      names = names.filter(name => name.split('.').every(nameSegment => !bannedNamesSet.has(nameSegment)))

      const enss: ENS[] = names.map(name => {
        return {
          subdomain: name,
          nftOwnerAddress: owner,
          content: '',
          ensOwnerAddress: '',
          name,
          resolver: '',
          tokenId: ''
        }
      })

      const enssWithWorldStatus: ENS[] = yield call(addWorldStatusToEachENS, enss)

      yield put(fetchWorldDeploymentsRequest(enssWithWorldStatus.filter(ens => ens.worldStatus).map(ens => ens.subdomain)))

      yield put(fetchExternalNamesSuccess(owner, enssWithWorldStatus))
    } catch (error) {
      const ensError: ENSError = { message: isErrorWithMessage(error) ? error.message : 'Unknown error' }
      yield put(fetchExternalNamesFailure(owner, ensError))
    }
  }

  function* handleConnectWallet(action: ConnectWalletSuccessAction) {
    yield put(fetchExternalNamesRequest(action.payload.wallet.address))
  }
}
