import { ethers } from 'ethers'
import { namehash } from '@ethersproject/hash'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { Network } from '@dcl/schemas'
import { BuilderClient, GetLandRedirectionHashesResult, Redirection, UploadLandRedirectionFileResult } from '@dcl/builder-client'
import { ContractName, getContract } from 'decentraland-transactions'
import { getChainIdByNetwork, getNetworkProvider, getSigner } from 'decentraland-dapps/dist/lib/eth'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { ENS__factory } from 'contracts/factories/ENS__factory'
import { ENSResolver__factory } from 'contracts/factories/ENSResolver__factory'
import { DCLController__factory } from 'contracts/factories/DCLController__factory'
import { ERC20__factory } from 'contracts/factories/ERC20__factory'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS, CONTROLLER_ADDRESS, MANA_ADDRESS } from 'modules/common/contracts'
import { getWallet } from 'modules/wallet/utils'
import { getCenter, getExplorerURL, getSelection } from 'modules/land/utils'
import { marketplace } from 'lib/api/marketplace'
import { getLands } from 'modules/land/selectors'
import { FETCH_LANDS_SUCCESS } from 'modules/land/actions'
import { Land } from 'modules/land/types'
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
  allowClaimManaFailure
} from './actions'
import { ENS, ENSOrigin, ENSError, Authorization } from './types'
import { getDomainFromName } from './utils'

export function* ensSaga(builderClient: BuilderClient) {
  yield takeLatest(FETCH_LANDS_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_ENS_AUTHORIZATION_REQUEST, handleFetchAuthorizationRequest)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
  yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
  yield takeEvery(ALLOW_CLAIM_MANA_REQUEST, handleApproveClaimManaRequest)

  function* handleConnectWallet() {
    yield put(fetchENSAuthorizationRequest())
    yield put(fetchENSListRequest())
  }

  function* handleFetchENSRequest(action: FetchENSRequestAction) {
    const { name, land } = action.payload
    const subdomain = name.toLowerCase() + '.dcl.eth'
    try {
      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const address = wallet.address
      const nodehash = namehash(subdomain)
      const ensContract = ENS__factory.connect(ENS_ADDRESS, signer)

      const resolverAddress: string = yield call(() => ensContract.resolver(nodehash))

      if (resolverAddress.toString() === ethers.constants.AddressZero) {
        yield put(
          fetchENSSuccess({
            name,
            address,
            subdomain,
            resolver: ethers.constants.AddressZero,
            content: ethers.constants.AddressZero
          })
        )
        return
      }

      const resolverContract = ENSResolver__factory.connect(resolverAddress, signer)

      const redirection: Redirection = {
        landURL: (function() {
          const selection = getSelection(land)
          const [x, y] = getCenter(selection)
          return getExplorerURL(x, y)
        })(),
        i18nCouldNotRedirectMsg: t('ipfs_api.not_redirected'),
        i18nClickHereMsg: t('global.click_here')
      }

      const { ipfsHash, contentHash }: UploadLandRedirectionFileResult = yield call(
        [builderClient, builderClient.uploadLandRedirectionFile],
        redirection
      )

      const currentContent: string = yield call(() => resolverContract.contenthash(nodehash))
      if (currentContent === ethers.constants.AddressZero) {
        yield put(
          fetchENSSuccess({
            address,
            name,
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
            address,
            name,
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
          address,
          name,
          subdomain,
          resolver: ENS_RESOLVER_ADDRESS,
          content: currentContent || ethers.constants.AddressZero,
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
        const redirection: Redirection = {
          landURL: (function() {
            const selection = getSelection(land)
            const [x, y] = getCenter(selection)
            return getExplorerURL(x, y)
          })(),
          i18nCouldNotRedirectMsg: t('ipfs_api.not_redirected'),
          i18nClickHereMsg: t('global.click_here')
        }

        const { contentHash }: UploadLandRedirectionFileResult = yield call(
          [builderClient, builderClient.uploadLandRedirectionFile],
          redirection
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
      const chainId = getChainIdByNetwork(Network.ETHEREUM)
      const contract = getContract(ContractName.MANAToken, chainId)
      const provider: Awaited<ReturnType<typeof getNetworkProvider>> = yield call(getNetworkProvider, chainId)
      const mana = new ethers.Contract(contract.address, contract.abi, new ethers.providers.Web3Provider(provider))
      const allowance: string = yield call(mana.allowance, from, CONTROLLER_ADDRESS)
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

      const landsWithRedirection: {
        land: Land
        redirection: Redirection
        isSameRedirection: (other: Redirection) => boolean
      }[] = lands.map(land => {
        return {
          land,
          redirection: {
            landURL: (function() {
              const selection = getSelection(land)
              const [x, y] = getCenter(selection)
              return getExplorerURL(x, y)
            })(),
            i18nCouldNotRedirectMsg: t('ipfs_api.not_redirected'),
            i18nClickHereMsg: t('global.click_here')
          },
          isSameRedirection: function(other: Redirection) {
            return (
              this.redirection.landURL === other.landURL &&
              this.redirection.i18nCouldNotRedirectMsg === other.i18nCouldNotRedirectMsg &&
              this.redirection.i18nClickHereMsg === other.i18nClickHereMsg
            )
          }
        }
      })

      const landHashes: { id: string; hash: string }[] = []

      const redirectionsWithContentHash: GetLandRedirectionHashesResult = yield call(
        [builderClient, builderClient.getLandRedirectionHashes],
        landsWithRedirection.map(land => land.redirection)
      )

      for (const redirectionWithContentHash of redirectionsWithContentHash) {
        const landId = landsWithRedirection.find(land => land.isSameRedirection(redirectionWithContentHash))!.land.id
        landHashes.push({ hash: `0x${redirectionWithContentHash.contentHash}`, id: landId })
      }

      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const address = wallet.address
      const ensContract = ENS__factory.connect(ENS_ADDRESS, signer)
      const domains: string[] = yield call(() => marketplace.fetchENSList(address))

      const ensList: ENS[] = yield call(() =>
        Promise.all(
          domains.map(async data => {
            const name = data
            const subdomain = `${data.toLowerCase()}.dcl.eth`
            let landId: string | undefined = undefined
            let content: string = ''

            const nodehash = namehash(subdomain)
            const resolverAddress: string = await ensContract.resolver(nodehash)
            const resolver = resolverAddress.toString()

            if (resolver !== ethers.constants.AddressZero) {
              const resolverContract = ENSResolver__factory.connect(resolverAddress, signer)
              content = await resolverContract.contenthash(nodehash)

              const land = landHashes.find(lh => lh.hash === content)
              if (land) {
                landId = land.id
              }
            }

            const ens: ENS = {
              address,
              name,
              subdomain,
              resolver,
              content,
              landId
            }

            return ens
          })
        )
      )

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

      const controllerContract = DCLController__factory.connect(CONTROLLER_ADDRESS, signer)
      const transaction: ethers.ContractTransaction = yield call(() => controllerContract.register(name, from))

      const ens: ENS = {
        address: wallet.address,
        name: name,
        subdomain: getDomainFromName(name),
        resolver: ethers.constants.AddressZero,
        content: ethers.constants.AddressZero
      }
      yield put(claimNameSuccess(ens, name, wallet.address, wallet.chainId, transaction.hash))
      yield put(closeModal('ClaimNameFatFingerModal'))
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(claimNameFailure(ensError))
    }
  }

  function* handleApproveClaimManaRequest(action: AllowClaimManaRequestAction) {
    const { allowance } = action.payload
    try {
      const wallet: Wallet = yield getWallet()
      const signer: ethers.Signer = yield getSigner()
      const from = wallet.address
      const manaContract = ERC20__factory.connect(MANA_ADDRESS, signer)

      const transaction: ethers.ContractTransaction = yield call(() => manaContract.approve(CONTROLLER_ADDRESS, allowance))

      yield put(allowClaimManaSuccess(allowance, from.toString(), wallet.chainId, transaction.hash))
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(allowClaimManaFailure(ensError))
    }
  }
}
