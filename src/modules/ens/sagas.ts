import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { ipfs } from 'lib/api/ipfs'
import { namehash } from '@ethersproject/hash'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import * as contentHash from 'content-hash'
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
  FETCH_ENS_LIST_REQUEST,
  FetchENSListRequestAction,
  fetchENSListRequest,
  fetchENSListSuccess,
  fetchENSListFailure
} from './actions'
import { ENS, ENSOrigin, ENSError } from './types'
import { getLands } from 'modules/land/selectors'
import { FETCH_LANDS_SUCCESS } from 'modules/land/actions'
import { getName } from 'modules/profile/selectors'

export function* ensSaga() {
  yield takeLatest(FETCH_LANDS_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
}

function* handleConnectWallet() {
  yield put(fetchENSListRequest())
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

function* handleFetchENSListRequest(_action: FetchENSListRequestAction) {
  try {
    const landHashes = []
    const lands = yield select(getLands)
    const alias = yield select(getName)

    for (let land of lands) {
      const ipfshash = yield call(() => ipfs.uploadRedirectionFile(land))
      const landHash = yield call(() => contentHash.fromIpfs(ipfshash))
      landHashes.push({ hash: `0x${landHash}`, id: land.id })
    }

    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const address = from.toString()
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))
    const domains: string[] = yield call(() => marketplace.fetchENSList(address))

    const ensList: ENS[] = []
    for (let subdomain of domains) {
      subdomain = subdomain.toLowerCase()
      const name = subdomain.split('.')[0]
      const nodehash = namehash(subdomain)
      const resolverAddress: Address = yield call(() => ensContract.methods.resolver(nodehash).call())
      const resolver = resolverAddress.toString()
      const isAlias = name.toLowerCase() === alias && alias.toLowerCase() && resolver === Address.ZERO.toString()

      const resolverContract = new ENSResolver(eth, resolverAddress)
      const content = yield call(() => resolverContract.methods.contenthash(nodehash).call())
      const land = landHashes.find(lh => lh.hash === content)
      const landId = land ? land.id : undefined

      ensList.push({
        address,
        subdomain,
        resolver,
        content,
        landId,
        isAlias
      })
    }
    yield put(fetchENSListSuccess(ensList))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchENSListFailure(ensError))
  }
}
