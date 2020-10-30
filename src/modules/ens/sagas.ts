import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { ipfs } from 'lib/api/ipfs'
import { namehash } from '@ethersproject/hash'
import { call, put, takeEvery, select } from 'redux-saga/effects'
import * as contentHash from 'content-hash'
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
  fetchDomainListSuccess,
  fetchDomainListFailure
} from './actions'
import { ENS as ENSContract } from 'contracts/ENS'
import { ENSResolver } from 'contracts/ENSResolver'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { marketplace } from 'lib/api/marketplace'
import { ENS, ENSOrigin, ENSError } from './types'

export function* ensSaga() {
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_DOMAIN_LIST_REQUEST, handleFetchDomainListRequest)
}

function* handleFetchENSRequest(action: FetchENSRequestAction) {
  const { subdomain, land } = action.payload
  try {
    const [eth, from]: [Eth, Address] = yield getEth()
    const address = from.toString()
    const nodehash = namehash(subdomain)
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))

    const resolverAddress: Address = yield call(() => ensContract.methods.resolver(nodehash).call())

    if (resolverAddress.toString() === Address.ZERO.toString()) {
      return yield put(
        fetchENSSuccess(
          {
            subdomain,
            resolver: Address.ZERO.toString(),
            content: Address.ZERO.toString()
          },
          address
        )
      )
    }

    const resolverContract = new ENSResolver(eth, resolverAddress)
    const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
    const landHash = contentHash.fromIpfs(ipfsHash)

    const currentContent = yield call(() => resolverContract.methods.contenthash(nodehash).call())
    if (currentContent === Address.ZERO.toString()) {
      return yield put(
        fetchENSSuccess(
          {
            subdomain,
            resolver: resolverAddress.toString(),
            content: Address.ZERO.toString(),
            ipfsHash
          },
          address
        )
      )
    }

    if (`0x${landHash}` === currentContent) {
      return yield put(
        fetchENSSuccess(
          {
            subdomain,
            resolver: ENS_RESOLVER_ADDRESS,
            content: landHash,
            ipfsHash,
            landId: land.id
          },
          address
        )
      )
    }

    yield put(fetchENSSuccess({ subdomain, resolver: ENS_RESOLVER_ADDRESS, content: landHash, landId: landHash }, address))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchENSFailure(ensError))
  }
}

function* handleSetENSResolverRequest(action: SetENSResolverRequestAction) {
  const { subdomain } = action.payload
  try {
    const [eth, from]: [Eth, Address] = yield getEth()
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
    const [eth, from]: [Eth, Address] = yield getEth()
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
    const owner = yield select(getAddress)
    const domains: string[] = yield call(() => marketplace.fetchDomainList(owner))
    const ensList: ENS[] = domains.map(subdomain => ({
      subdomain: subdomain.toLowerCase(),
      resolver: Address.ZERO.toString(),
      content: Address.ZERO.toString()
    }))
    yield put(fetchDomainListSuccess(ensList, owner))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchDomainListFailure(ensError))
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
