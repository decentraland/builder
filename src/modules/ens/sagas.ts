import { Eth } from 'web3x-es/eth'
import { call, put, takeEvery, select } from 'redux-saga/effects'
import {
  GET_ENS_REQUEST,
  GetENSRequestAction,
  getENSSuccess,
  getENSFailure,
  SET_ENS_CONTENT_REQUEST,
  SetENSContentRequestAction,
  setENSContentSuccess,
  setENSContentFailure,
  SET_ENS_RESOLVER_REQUEST,
  SetENSResolverRequestAction,
  setENSResolverSuccess,
  setENSResolverFailure,
  GET_DOMAIN_LIST_REQUEST,
  GetDomainListRequestAction,
  getDomainListSuccess,
  getDomainListFailure
} from './actions'
import { ENS } from 'contracts/ENS'
import { ENSResolver } from 'contracts/ENSResolver'
import { Address } from 'web3x-es/address'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { ipfs } from 'lib/api/ipfs'
import { namehash } from '@ethersproject/hash'
import { ENS_EMPTY_CONTENT, ENS_EMPTY_RESOLVER } from './constants'
import { marketplace } from 'lib/api/marketplace'

import * as contentHash from 'content-hash'

export function* ensSaga() {
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(GET_DOMAIN_LIST_REQUEST, handleGetDomainListRequest)
  yield takeEvery(GET_ENS_REQUEST, handleGetENSRequest)
}

function* handleSetENSResolverRequest(action: SetENSResolverRequestAction) {
  const { land, ens } = action.payload
  try {
    const [eth, from] = yield getEth()
    const nodehash = namehash(ens)
    const ensContract = new ENS(eth, Address.fromString(ENS_ADDRESS))

    const txHash = yield call(() =>
      ensContract.methods
        .setResolver(nodehash, Address.fromString(ENS_RESOLVER_ADDRESS))
        .send({ from })
        .getTxHash()
    )
    yield put(setENSResolverSuccess(ens, land, txHash))
  } catch (error) {
    yield put(setENSResolverFailure(ens, land, { ...error, origin: 'SET_ENS_RESOLVER' }))
  }
}

function* handleSetENSContentRequest(action: SetENSContentRequestAction) {
  const { land, ens } = action.payload
  try {
    const [eth, from] = yield getEth()
    const nodehash = namehash(ens)
    const resolverContract = new ENSResolver(eth, Address.fromString(ENS_RESOLVER_ADDRESS))
    const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
    const hash = contentHash.fromIpfs(ipfsHash)
    const txHash = yield call(() =>
      resolverContract.methods
        .setContenthash(nodehash, `0x${hash}`)
        .send({ from })
        .getTxHash()
    )
    yield put(setENSContentSuccess(ens, land, txHash))
  } catch (error) {
    yield put(setENSContentFailure(ens, land, { ...error, origin: 'SET_ENS_CONTENT' }))
  }
}

function* handleGetDomainListRequest(_action: GetDomainListRequestAction) {
  try {
    const owner = yield select(getAddress)
    const result = yield marketplace.fetchDomainList(owner)
    yield put(getDomainListSuccess(result))
  } catch (error) {
    yield put(getDomainListFailure({ ...error, origin: '', code: 0 }))
  }
}

function* handleGetENSRequest(action: GetENSRequestAction) {
  const { ens, land } = action.payload
  try {
    const [eth] = yield getEth()
    const nodehash = namehash(ens)
    const ensContract = new ENS(eth, Address.fromString(ENS_ADDRESS))
    let resolverAddress: Address = yield call(() => ensContract.methods.resolver(nodehash).call())

    if (resolverAddress.toString() === ENS_EMPTY_RESOLVER) {
      return yield put(
        getENSSuccess(ens, {
          resolver: ENS_EMPTY_RESOLVER,
          content: ENS_EMPTY_CONTENT,
          type: 'EmptyResolver'
        })
      )
    }

    const resolverContract = new ENSResolver(eth, Address.fromString(ENS_RESOLVER_ADDRESS))
    const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
    const hash = contentHash.fromIpfs(ipfsHash)
    const currentContent = yield call(() => resolverContract.methods.contenthash(nodehash).call())
    if (currentContent === ENS_EMPTY_CONTENT) {
      return yield put(
        getENSSuccess(ens, {
          resolver: ENS_RESOLVER_ADDRESS,
          content: currentContent,
          type: 'EmptyContent'
        })
      )
    }
    if (`0x${hash}` === currentContent) {
      return yield put(
        getENSSuccess(ens, {
          resolver: ENS_RESOLVER_ADDRESS,
          content: currentContent,
          type: 'EqualContent'
        })
      )
    }
    yield put(
      getENSSuccess(ens, {
        resolver: ENS_RESOLVER_ADDRESS,
        content: currentContent,
        type: 'DifferentContent'
      })
    )
  } catch (error) {
    yield put(getENSFailure({ ...error, origin: '', code: 0 }))
  }
}

function* getEth() {
  const eth = Eth.fromCurrentProvider()
  if (!eth) {
    throw new Error('Wallet not found')
  }

  const fromAddress = yield select(getAddress)
  if (!fromAddress) {
    throw new Error(`Invalid from address: ${fromAddress}`)
  }

  const from = Address.fromString(fromAddress)

  return [eth, from]
}
