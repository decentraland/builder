import { takeLatest, put, call, takeEvery } from 'redux-saga/effects'
import {
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  loadProfileSuccess,
  loadProfileFailure,
  loadProfileRequest,
  changeProfileSuccess,
  changeProfileFailure,
  CHANGE_PROFILE_REQUEST,
  ChangeProfileRequestAction,
  SetAliasRequestAction,
  SET_ALIAS_REQUEST,
  changeProfileRequest,
  setAliasFailure
} from 'modules/profile/actions'
import { Profile } from 'modules/profile/types'
import { content } from 'lib/api/peer'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { CatalystClient, DeploymentBuilder } from 'dcl-catalyst-client'
import { env } from 'decentraland-commons'
import { EntityType } from 'dcl-catalyst-commons'
import { Eth } from 'web3x-es/eth'
import { Personal } from 'web3x-es/personal'
import { Authenticator } from 'dcl-crypto'
import { Address } from 'web3x-es/address'

export function* profileSaga() {
  yield takeEvery(SET_ALIAS_REQUEST, handleSetAlias)
  yield takeEvery(CHANGE_PROFILE_REQUEST, handleChangeProfile)
  yield takeEvery(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
}

function* handleSetAlias(action: SetAliasRequestAction) {
  const { address, name } = action.payload
  try {
    const client = new CatalystClient(env.get('REACT_APP_PEER_URL'), 'builder')
    const entities = yield client.fetchEntitiesByPointers(EntityType.PROFILE, [address.toLowerCase()])
    const profile = entities.length > 0 ? entities[0] : null

    const avatar = profile && profile.metadata && profile.metadata.avatars[0]
    avatar.name = name
    avatar.hasClaimedName = true

    yield put(changeProfileRequest(address, profile))
  } catch (error) {
    yield put(setAliasFailure(address, error.message))
  }
}

function* handleChangeProfile(action: ChangeProfileRequestAction) {
  const { address } = action.payload
  try {
    const { profile } = action.payload

    if (!profile) {
      return console.log('New Profile undefined')
    }

    // Build entity
    const content: Map<string, string> = new Map(
      (profile.content || []).map(({ file, hash }: { file: string; hash: string }) => [file, hash])
    )
    console.log({ metadata: profile.metadata, content, address })
    const deployPreparationData = yield call(() =>
      DeploymentBuilder.buildEntityWithoutNewFiles(EntityType.PROFILE, [address], content, profile.metadata)
    )

    // Request signature
    const eth = Eth.fromCurrentProvider()
    const client = new CatalystClient(env.get('REACT_APP_PEER_URL'), 'builder')
    if (eth) {
      const personal = new Personal(eth.provider)
      const signature = yield personal.sign(deployPreparationData.entityId, Address.fromString(address), '')

      // Deploy change
      const authChain = Authenticator.createSimpleAuthChain(deployPreparationData.entityId, address, signature)
      const result = yield call(() => client.deployEntity({ ...deployPreparationData, authChain }))
      console.log({ result })

      yield put(changeProfileSuccess(address, profile))
    }
  } catch (error) {
    yield put(changeProfileFailure(address, error.message))
  }
}

function* handleLoadProfileRequest(action: LoadProfileRequestAction) {
  const { address } = action.payload
  try {
    const profile: Profile = yield call(() => content.fetchProfile(address))
    yield put(loadProfileSuccess(address, profile))
  } catch (error) {
    yield put(loadProfileFailure(address, error.message))
  }
}

function* handleLoginSuccess(action: LoginSuccessAction) {
  yield put(loadProfileRequest(action.payload.wallet.address))
}
