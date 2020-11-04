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
  fetchDomainListFailure
} from './actions'
import { ENS, ENSOrigin, ENSError } from './types'

export function* ensSaga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_DOMAIN_LIST_REQUEST, handleFetchDomainListRequest)
}

function* handleConnectWallet() {
  yield put(fetchDomainListRequest())
}

function* handleFetchENSRequest(action: FetchENSRequestAction) {
  const { subdomain, land } = action.payload
  try {
    const [eth, from]: [Eth, Address] = yield getCurrentAddress()
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
  const { subdomain } = action.payload
  try {
    const [eth, from]: [Eth, Address] = yield getCurrentAddress()
    const nodehash = namehash(subdomain)
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))

    const txHash = yield call(() =>
      ensContract.methods
        .setResolver(nodehash, Address.fromString(ENS_RESOLVER_ADDRESS))
        .send({ from })
        .getTxHash()
    )
    yield put(setENSResolverSuccess(subdomain, ENS_RESOLVER_ADDRESS, from.toString(), txHash))
  } catch (error) {
    const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.RESOLVER }
    yield put(setENSResolverFailure(subdomain, ensError))
  }
}

function* handleSetENSContentRequest(action: SetENSContentRequestAction) {
  const { subdomain, land } = action.payload
  try {
    const [eth, from]: [Eth, Address] = yield getCurrentAddress()
    const nodehash = namehash(subdomain)
    const resolverContract = new ENSResolver(eth, Address.fromString(ENS_RESOLVER_ADDRESS))
    const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
    const hash = contentHash.fromIpfs(ipfsHash)

    const txHash = yield call(() =>
      resolverContract.methods
        .setContenthash(nodehash, `0x${hash}`)
        .send({ from })
        .getTxHash()
    )
    yield put(setENSContentSuccess(subdomain, hash, land, from.toString(), txHash))
  } catch (error) {
    const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.CONTENT }
    yield put(setENSContentFailure(subdomain, land, ensError))
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
