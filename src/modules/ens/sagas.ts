import { Eth, SendTx } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { TransactionReceipt } from 'web3x-es/formatters'
import { Personal } from 'web3x-es/personal'
import { namehash } from '@ethersproject/hash'
import { push } from 'connected-react-router'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import * as contentHash from 'content-hash'
import { CatalystClient, DeploymentBuilder } from 'dcl-catalyst-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import { Avatar } from 'decentraland-ui'
import { Authenticator } from 'dcl-crypto'
import { createEth } from 'decentraland-dapps/dist/lib/eth'

import { ENS as ENSContract } from 'contracts/ENS'
import { ENSResolver } from 'contracts/ENSResolver'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS, CONTROLLER_ADDRESS, MANA_ADDRESS } from 'modules/common/contracts'
import { DCLController } from 'contracts/DCLController'
import { ERC20 as MANAToken } from 'contracts/ERC20'
import { getCurrentAddress } from 'modules/wallet/utils'
import { marketplace } from 'lib/api/marketplace'
import { ipfs } from 'lib/api/ipfs'
import { getLands } from 'modules/land/selectors'
import { FETCH_LANDS_SUCCESS } from 'modules/land/actions'
import { changeProfile } from 'modules/profile/actions'
import { Profile } from 'modules/profile/types'
import { PEER_URL } from 'lib/api/peer'
import { locations } from 'routing/locations'
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
  SET_ALIAS_REQUEST,
  SetAliasRequestAction,
  setAliasSuccess,
  setAliasFailure,
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
import { getDefaultProfileEntity, getDomainFromName, setProfileFromEntity } from './utils'

export function* ensSaga() {
  yield takeLatest(SET_ALIAS_REQUEST, handleSetAlias)
  yield takeLatest(FETCH_LANDS_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_ENS_AUTHORIZATION_REQUEST, handleFetchAuthorizationRequest)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
  yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
  yield takeEvery(ALLOW_CLAIM_MANA_REQUEST, handleApproveClaimManaRequest)
}

function* handleConnectWallet() {
  yield put(fetchENSAuthorizationRequest())
  yield put(fetchENSListRequest())
}

function* handleSetAlias(action: SetAliasRequestAction) {
  const { address, name } = action.payload
  try {
    const client = new CatalystClient(PEER_URL, 'builder')
    const entities: Entity[] = yield call(() => client.fetchEntitiesByPointers(EntityType.PROFILE, [address.toLowerCase()]))
    let entity: Entity
    if (entities.length > 0) {
      entity = entities[0]
    } else {
      entity = yield call(() => getDefaultProfileEntity())
    }

    const avatar = entity && entity.metadata && entity.metadata.avatars[0]
    const newAvatar: Avatar = {
      ...avatar,
      hasClaimedName: true,
      name
    }

    const newEntity = {
      ...entity,
      userId: address,
      ethAddress: address,
      metadata: {
        ...entity.metadata,
        avatars: [newAvatar, ...entity.metadata.avatars.slice(1)]
      }
    }
    // Build entity
    const content: Map<string, string> = new Map((newEntity.content || []).map(({ file, hash }) => [file, hash]))

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

      const stateEntity = yield call(() => setProfileFromEntity(newEntity))
      yield put(setAliasSuccess(address, name))
      yield put(changeProfile(address, stateEntity.metadata as Profile))
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

function* handleFetchAuthorizationRequest(_action: FetchENSAuthorizationRequestAction) {
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const manaContract = new MANAToken(eth, Address.fromString(MANA_ADDRESS))
    const allowance: string = yield call(() => manaContract.methods.allowance(from, Address.fromString(CONTROLLER_ADDRESS)).call())
    const authorization: Authorization = { allowance }

    yield put(fetchENSAuthorizationSuccess(authorization, from.toString()))
  } catch (error) {
    const allowError: ENSError = { message: error.message }
    yield put(fetchENSAuthorizationFailure(allowError))
  }
}

function* handleFetchENSListRequest(_action: FetchENSListRequestAction) {
  try {
    const landHashes: { id: string; hash: string }[] = []
    const lands: Land[] = yield select(getLands)

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
      let content: string = ''

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
  const { name } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const controllerContract = new DCLController(eth, Address.fromString(CONTROLLER_ADDRESS))
    const tx: SendTx<TransactionReceipt> = yield call(() => controllerContract.methods.register(name, from).send({ from }))
    const txHash: string = yield call(() => tx.getTxHash())

    const ens: ENS = {
      address: from.toString(),
      subdomain: getDomainFromName(name),
      resolver: Address.ZERO.toString(),
      content: Address.ZERO.toString()
    }
    yield put(claimNameSuccess(ens, name, from.toString(), txHash))
    yield put(closeModal('ClaimNameFatFingerModal'))
    yield put(push(locations.activity()))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(claimNameFailure(ensError))
  }
}

function* handleApproveClaimManaRequest(action: AllowClaimManaRequestAction) {
  const { allowance } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const manaContract = new MANAToken(eth, Address.fromString(MANA_ADDRESS))

    const txHash: string = yield call(() =>
      manaContract.methods
        .approve(Address.fromString(CONTROLLER_ADDRESS), allowance)
        .send({ from })
        .getTxHash()
    )

    yield put(allowClaimManaSuccess(allowance, from.toString(), txHash))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(allowClaimManaFailure(ensError))
  }
}
