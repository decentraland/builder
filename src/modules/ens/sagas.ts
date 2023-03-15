import { BigNumber, ethers } from 'ethers'
import { namehash } from '@ethersproject/hash'
import PQueue from 'p-queue'
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { ChainId, Network } from '@dcl/schemas'
import { BuilderClient, LandCoords, LandHashes } from '@dcl/builder-client'
import { ContractName, getContract } from 'decentraland-transactions'
import { getChainIdByNetwork, getNetworkProvider, getSigner } from 'decentraland-dapps/dist/lib/eth'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { getCurrentLocale } from 'decentraland-dapps/dist/modules/translation/utils'
import { waitForTx } from 'decentraland-dapps/dist/modules/transaction/utils'

import { ENS__factory } from 'contracts/factories/ENS__factory'
import { ENSResolver__factory } from 'contracts/factories/ENSResolver__factory'
import { DCLRegistrar__factory } from 'contracts/factories/DCLRegistrar__factory'
import { DCLController__factory } from 'contracts/factories/DCLController__factory'
import { ERC20__factory } from 'contracts/factories/ERC20__factory'
import {
  ENS_ADDRESS,
  ENS_RESOLVER_ADDRESS,
  CONTROLLER_ADDRESS,
  CONTROLLER_V2_ADDRESS,
  MANA_ADDRESS,
  REGISTRAR_ADDRESS
} from 'modules/common/contracts'
import { getWallet } from 'modules/wallet/utils'
import { getIsDCLControllerV2Enabled } from 'modules/features/selectors'
import { getCenter, getSelection } from 'modules/land/utils'
import { marketplace } from 'lib/api/marketplace'
import { getLands } from 'modules/land/selectors'
import { FETCH_LANDS_SUCCESS } from 'modules/land/actions'
import { Land, LandType } from 'modules/land/types'
import { closeModal } from 'modules/modal/actions'
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
  claimNameTransactionSubmitted
} from './actions'
import { ENS, ENSOrigin, ENSError, Authorization } from './types'
import { getDomainFromName } from './utils'

export function* ensSaga(builderClient: BuilderClient) {
  yield takeLatest(FETCH_LANDS_SUCCESS, handleFetchLandsSuccess)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_ENS_AUTHORIZATION_REQUEST, handleFetchAuthorizationRequest)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
  yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
  yield takeEvery(ALLOW_CLAIM_MANA_REQUEST, handleApproveClaimManaRequest)
  yield takeEvery(RECLAIM_NAME_REQUEST, handleReclaimNameRequest)

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

      if (resolverAddress.toString() === ethers.constants.AddressZero) {
        yield put(
          fetchENSSuccess({
            name,
            tokenId,
            ensOwnerAddress: owner,
            nftOwnerAddress: address,
            subdomain,
            resolver: ethers.constants.AddressZero,
            content: ethers.constants.AddressZero
          })
        )
        return
      }

      const resolverContract = ENSResolver__factory.connect(resolverAddress, signer)

      const [x, y] = getCenter(getSelection(land))

      const { ipfsHash, contentHash }: LandHashes = yield call(
        [builderClient, 'createLandRedirectionFile'],
        { x, y },
        getCurrentLocale().locale
      )

      const currentContent: string = yield call([resolverContract, 'contenthash'], nodehash)
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
            ipfsHash
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
            landId: land.id
          })
        )
        return
      }

      yield put(
        fetchENSSuccess({
          name,
          tokenId,
          ensOwnerAddress: owner,
          nftOwnerAddress: address,
          subdomain,
          resolver: ENS_RESOLVER_ADDRESS,
          content: currentContent ?? ethers.constants.AddressZero,
          landId: ''
        })
      )
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(fetchENSFailure(ensError))
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
      const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.RESOLVER }
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
      const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.CONTENT }
      yield put(setENSContentFailure(ens, land, ensError))
    }
  }

  function* handleFetchAuthorizationRequest(_action: FetchENSAuthorizationRequestAction) {
    try {
      const from: string = yield select(getAddress)
      const chainId: ChainId = yield call(getChainIdByNetwork, Network.ETHEREUM)
      const contract = getContract(ContractName.MANAToken, chainId)
      const provider: Awaited<ReturnType<typeof getNetworkProvider>> = yield call(getNetworkProvider, chainId)
      const mana = new ethers.Contract(contract.address, contract.abi, new ethers.providers.Web3Provider(provider))
      const isDCLControllerV2Enabled: boolean = yield select(getIsDCLControllerV2Enabled)
      const controllerAddress = isDCLControllerV2Enabled ? CONTROLLER_V2_ADDRESS : CONTROLLER_ADDRESS
      console.log(controllerAddress)
      const allowance: string = yield call(mana.allowance, from, controllerAddress)
      const authorization: Authorization = { allowance }

      yield put(fetchENSAuthorizationSuccess(authorization, from.toString()))
    } catch (error) {
      const allowError: ENSError = { message: error.message }
      yield put(fetchENSAuthorizationFailure(allowError))
    }
  }

  function* handleFetchENSListRequest(_action: FetchENSListRequestAction) {
    try {
      const lands: Land[] = yield select(getLands)
      const coordsList = lands.map(land => getCenter(getSelection(land))).map(coords => ({ x: coords[0], y: coords[1] }))
      const coordsWithHashesList: (LandCoords & LandHashes)[] =
        coordsList.length > 0 ? yield call([builderClient, 'getLandRedirectionHashes'], coordsList, getCurrentLocale().locale) : []

      const landHashes: { id: string; hash: string }[] = []

      for (const { x, y, contentHash } of coordsWithHashesList) {
        const landId = lands.find(land => {
          if (land.type === LandType.ESTATE) {
            return land.parcels!.some(parcel => parcel.x === x && parcel.y === y)
          }
          return land.x === x && land.y === y
        })!.id

        landHashes.push({ hash: `0x${contentHash}`, id: landId })
      }

      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const address = wallet.address
      const ensContract = ENS__factory.connect(ENS_ADDRESS, signer)
      const dclRegistrarContract = DCLRegistrar__factory.connect(REGISTRAR_ADDRESS, signer)
      const domains: string[] = yield call(() => marketplace.fetchENSList(address))

      const REQUESTS_BATCH_SIZE = 25
      const queue = new PQueue({ concurrency: REQUESTS_BATCH_SIZE })

      const promisesOfENS: (() => Promise<ENS>)[] = domains.map(data => {
        return async () => {
          const name = data
          const subdomain = `${data.toLowerCase()}.dcl.eth`
          let landId: string | undefined = undefined
          let content = ''

          const nodehash = namehash(subdomain)
          const [resolverAddress, owner, tokenId]: [string, string, string] = await Promise.all([
            ensContract.resolver(nodehash),
            ensContract.owner(nodehash).then(owner => owner.toLowerCase()),
            dclRegistrarContract.getTokenId(name).then(name => name.toString())
          ])
          const resolver = resolverAddress.toString()

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

          const ens: ENS = {
            name,
            tokenId,
            ensOwnerAddress: owner,
            nftOwnerAddress: address,
            subdomain,
            resolver,
            content,
            landId
          }

          return ens
        }
      })

      const ensList: ENS[] = yield queue.addAll(promisesOfENS)
      yield put(fetchENSListSuccess(ensList))
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(fetchENSListFailure(ensError))
    }
  }

  function* handleClaimNameRequest(action: ClaimNameRequestAction) {
    const { name } = action.payload
    try {
      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const from = wallet.address

      const isDCLControllerV2Enabled: boolean = yield select(getIsDCLControllerV2Enabled)
      const controllerAddress = isDCLControllerV2Enabled ? CONTROLLER_V2_ADDRESS : CONTROLLER_ADDRESS
      const controllerContract = DCLController__factory.connect(controllerAddress, signer)
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
      const ensError: ENSError = { message: error.message }
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
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(reclaimNameFailure(ensError))
    }
  }

  function* handleApproveClaimManaRequest(action: AllowClaimManaRequestAction) {
    const { allowance } = action.payload
    try {
      const wallet: Wallet = yield call(getWallet)
      const signer: ethers.Signer = yield call(getSigner)
      const from = wallet.address
      const manaContract: ReturnType<typeof ERC20__factory['connect']> = yield call([ERC20__factory, 'connect'], MANA_ADDRESS, signer)
      const isDCLControllerV2Enabled: boolean = yield select(getIsDCLControllerV2Enabled)
      const controllerAddress = isDCLControllerV2Enabled ? CONTROLLER_V2_ADDRESS : CONTROLLER_ADDRESS
      const transaction: ethers.ContractTransaction = yield call([manaContract, 'approve'], controllerAddress, allowance)

      yield put(allowClaimManaSuccess(allowance, from.toString(), wallet.chainId, transaction.hash))
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(allowClaimManaFailure(ensError))
    }
  }
}
