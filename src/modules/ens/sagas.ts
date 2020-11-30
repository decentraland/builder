import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { ipfs } from 'lib/api/ipfs'
import { namehash } from '@ethersproject/hash'
import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects'
import * as contentHash from 'content-hash'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { ENS as ENSContract } from 'contracts/ENS'
import { ENSResolver } from 'contracts/ENSResolver'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { getCurrentAddress } from 'modules/wallet/utils'
import { marketplace } from 'lib/api/marketplace'
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
  FETCH_DOMAIN_LIST_REQUEST,
  FetchDomainListRequestAction,
  fetchDomainListRequest,
  fetchDomainListSuccess,
  fetchDomainListFailure,
  CLAIM_NAME_REQUEST,
  ClaimNameRequestAction,
  claimNameSuccess,
  claimNameFailure
} from './actions'
import { ENS, ENSOrigin, ENSError } from './types'

export function* ensSaga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_DOMAIN_LIST_REQUEST, handleFetchDomainListRequest)
  yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
}

function* handleConnectWallet() {
  yield put(fetchDomainListRequest())
}

function* handleFetchENSRequest(action: FetchENSRequestAction) {
  const { subdomain, land } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const address = from.toString()
    const nodehash = namehash(subdomain)
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))

    const resolverAddress: Address = yield call(() => ensContract.methods.resolver(nodehash).call())

    if (resolverAddress.toString() === Address.ZERO.toString()) {
      return yield put(
        fetchENSSuccess({
          address,
          subdomain,
          resolver: Address.ZERO.toString(),
          content: Address.ZERO.toString()
        })
      )
    }

    const resolverContract = new ENSResolver(eth, resolverAddress)
    const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
    const landHash = contentHash.fromIpfs(ipfsHash)

    const currentContent = yield call(() => resolverContract.methods.contenthash(nodehash).call())
    if (currentContent === Address.ZERO.toString()) {
      return yield put(
        fetchENSSuccess({
          address,
          subdomain,
          resolver: resolverAddress.toString(),
          content: Address.ZERO.toString(),
          ipfsHash
        })
      )
    }

    if (`0x${landHash}` === currentContent) {
      return yield put(
        fetchENSSuccess({
          address,
          subdomain,
          resolver: ENS_RESOLVER_ADDRESS,
          content: landHash,
          ipfsHash,
          landId: land.id
        })
      )
    }

    yield put(
      fetchENSSuccess({
        address,
        subdomain,
        resolver: ENS_RESOLVER_ADDRESS,
        content: currentContent || Address.ZERO.toString(),
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
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const nodehash = namehash(ens.subdomain)
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))

    const txHash = yield call(() =>
      ensContract.methods
        .setResolver(nodehash, Address.fromString(ENS_RESOLVER_ADDRESS))
        .send({ from })
        .getTxHash()
    )
    yield put(setENSResolverSuccess(ens, ENS_RESOLVER_ADDRESS, from.toString(), txHash))
  } catch (error) {
    const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.RESOLVER }
    yield put(setENSResolverFailure(ens, ensError))
  }
}

function* handleSetENSContentRequest(action: SetENSContentRequestAction) {
  const { ens, land } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    let content = ''

    if (land) {
      const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
      content = `0x${contentHash.fromIpfs(ipfsHash)}`
    } else {
      content = Address.ZERO.toString()
    }

    const nodehash = namehash(ens.subdomain)
    const resolverContract = new ENSResolver(eth, Address.fromString(ENS_RESOLVER_ADDRESS))

    const txHash = yield call(() =>
      resolverContract.methods
        .setContenthash(nodehash, content)
        .send({ from })
        .getTxHash()
    )

    yield put(setENSContentSuccess(ens, content, land, from.toString(), txHash))
  } catch (error) {
    const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.CONTENT }
    yield put(setENSContentFailure(ens, land, ensError))
  }
}

function* handleFetchDomainListRequest(_action: FetchDomainListRequestAction) {
  try {
    const address = yield select(getAddress)
    const domains: string[] = yield call(() => marketplace.fetchDomainList(address))
    const ensList: ENS[] = domains.map(subdomain => ({
      address,
      subdomain: subdomain.toLowerCase(),
      resolver: Address.ZERO.toString(),
      content: Address.ZERO.toString()
    }))
    yield put(fetchDomainListSuccess(ensList))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchDomainListFailure(ensError))
  }
}

function* handleClaimNameRequest(action: ClaimNameRequestAction) {
  const { name } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const txHash = ''
    const ens = {} as ENS
    console.log('handleClaimName', ens, name, eth)
    yield put(claimNameSuccess(ens, name, from.toString(), txHash)) // ens: ENS, name: string, address: string, txHash: string
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(claimNameFailure(ensError))
  }
}
