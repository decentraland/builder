import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { ipfs } from 'lib/api/ipfs'
import { namehash } from '@ethersproject/hash'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import * as contentHash from 'content-hash'
import { CatalystClient, DeploymentBuilder, DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { EntityType } from 'dcl-catalyst-commons'
import { Avatar } from 'decentraland-ui'
import { Personal } from 'web3x-es/personal'
import { Authenticator } from 'dcl-crypto'
import { createEth } from 'decentraland-dapps/dist/lib/eth'

import { ENS as ENSContract } from 'contracts/ENS'
import { ENSResolver } from 'contracts/ENSResolver'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { getCurrentAddress } from 'modules/wallet/utils'
import { marketplace } from 'lib/api/marketplace'
import { getLands } from 'modules/land/selectors'
import { FETCH_LANDS_SUCCESS } from 'modules/land/actions'
import { changeProfile } from 'modules/profile/actions'
import { Profile } from 'modules/profile/types'
import { PEER_URL } from 'lib/api/peer'

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
  fetchENSListFailure,
  SET_ALIAS_REQUEST,
  SetAliasRequestAction,
  setAliasSuccess,
  setAliasFailure,
  CLAIM_NAME_REQUEST,
  ClaimNameRequestAction,
  claimNameSuccess,
  claimNameFailure
} from './actions'
import { ENS, ENSOrigin, ENSError } from './types'

export function* ensSaga() {
  yield takeLatest(SET_ALIAS_REQUEST, handleSetAlias)
  yield takeLatest(FETCH_LANDS_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
  yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
}

function* handleConnectWallet() {
  yield put(fetchENSListRequest())
}

function* handleSetAlias(action: SetAliasRequestAction) {
  const { address, name } = action.payload
  try {
    const client = new CatalystClient(PEER_URL, 'builder')
    const entities: DeploymentWithMetadataContentAndPointers[] = yield client.fetchEntitiesByPointers(EntityType.PROFILE, [
      address.toLowerCase()
    ])
    const entity = entities.length > 0 ? entities[0] : null

    if (!entity) {
      throw new Error('entity is null')
    }
    const avatar = entity && entity.metadata && entity.metadata.avatars[0]
    const newAvatar: Avatar = {
      ...avatar,
      hasClaimedName: true,
      name
    }

    const newEntity = {
      ...entity,
      metadata: {
        ...entity.metadata,
        avatars: [newAvatar, ...entity.metadata.avatars.slice(1)]
      }
    }
    // Build entity
    const content: Map<string, string> = new Map((newEntity.content || []).map(({ key, hash }) => [key, hash]))

    const deployPreparationData = yield call(() =>
      DeploymentBuilder.buildEntityWithoutNewFiles(EntityType.PROFILE, [address], content, newEntity.metadata)
    )

    // Request signature
    const eth: Eth | null = yield call(createEth)

    if (eth) {
      const personal = new Personal(eth.provider)
      const signature = yield personal.sign(deployPreparationData.entityId, Address.fromString(address), '')

      // Deploy change
      const authChain = Authenticator.createSimpleAuthChain(deployPreparationData.entityId, address, signature)
      yield call(() => client.deployEntity({ ...deployPreparationData, authChain }))

      yield put(setAliasSuccess(address, name))
      yield put(changeProfile(address, newEntity.metadata as Profile))
    }
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(setAliasFailure(address, ensError))
  }
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

function* handleFetchENSListRequest(_action: FetchENSListRequestAction) {
  try {
    const landHashes = []
    const lands = yield select(getLands)

    for (let land of lands) {
      const landHash = yield call(() => ipfs.computeLandHash(land))
      landHashes.push({ hash: `0x${landHash}`, id: land.id })
    }

    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const address = from.toString()
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))
    const domains: string[] = yield call(() => marketplace.fetchENSList(address))
    const ensList: ENS[] = []
    for (let subdomain of domains) {
      subdomain = subdomain.toLowerCase()
      let landId: string | undefined = undefined
      let content = '' // TODO: i left this as empty string because it cannot be undefined, probably we can change the type so it can be

      const nodehash = namehash(subdomain)
      const resolverAddress: Address = yield call(() => ensContract.methods.resolver(nodehash).call())
      const resolver = resolverAddress.toString()

      if (resolver !== Address.ZERO.toString()) {
        const resolverContract = new ENSResolver(eth, resolverAddress)
        content = yield call(() => resolverContract.methods.contenthash(nodehash).call())
        const land = landHashes.find(lh => lh.hash === content)
        if (land) {
          landId = land.id
        }
      }

      ensList.push({
        address,
        subdomain,
        resolver,
        content,
        landId
      })
    }
    yield put(fetchENSListSuccess(ensList))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchENSListFailure(ensError))
  }
}

function* handleClaimNameRequest(action: ClaimNameRequestAction) {
  const { ens, name } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const txHash = ''
    console.log('handleClaimName', ens, name, eth)
    yield put(claimNameSuccess(ens, name, from.toString(), txHash)) // ens: ENS, name: string, address: string, txHash: string
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(claimNameFailure(ensError))
  }
}
