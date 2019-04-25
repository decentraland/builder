import { call, put, takeLatest, select } from 'redux-saga/effects'

import {
  LOAD_ASSET_PACKS_REQUEST,
  loadAssetPacksSuccess,
  loadAssetPacksFailure,
  LoadAssetPacksRequestAction
} from 'modules/assetPack/actions'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getData as getAssets } from 'modules/asset/selectors'
import { getAvailableAssetPackIds } from 'modules/ui/sidebar/selectors'
import { BaseAssetPack, FullAssetPack } from 'modules/assetPack/types'
import { setAvailableAssetPacks, setNewAssetPacks } from 'modules/ui/sidebar/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { toggleAssetPack } from 'modules/project/actions'
import { api } from 'lib/api'
import { getDefualtSelection } from './utils'

export function* assetPackSaga() {
  yield takeLatest(LOAD_ASSET_PACKS_REQUEST, handleLoadAssetPacks)
}

function* handleLoadAssetPacks(_: LoadAssetPacksRequestAction) {
  try {
    const remoteAssetPacks: BaseAssetPack[] = yield call(() => api.fetchAssetPacks())

    // Asset pack ids available last time the user visited
    const previousAvailableAssetPackIds: ReturnType<typeof getAvailableAssetPackIds> = yield select(getAvailableAssetPackIds)

    // Current available asset packs
    const currentAvailableAssetPackIds = remoteAssetPacks.map(assetPack => assetPack.id)

    // New asset packs since last visit
    const newAssetPackIds = []
    for (const assetPackId of currentAvailableAssetPackIds) {
      if (!previousAvailableAssetPackIds.includes(assetPackId)) {
        newAssetPackIds.push(assetPackId)
      }
    }

    // Update the available asset packs in state
    yield put(setAvailableAssetPacks(currentAvailableAssetPackIds))

    // Update the new asset packs in state
    yield put(setNewAssetPacks(newAssetPackIds))

    // Get user selection of asset packs
    let selectedAssetPackIds: Set<string>
    const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
    if (!project) {
      selectedAssetPackIds = new Set()
    } else if (project.assetPackIds && project.assetPackIds.length > 0) {
      selectedAssetPackIds = new Set(project!.assetPackIds)
    } else {
      const defaultSelection = getDefualtSelection(remoteAssetPacks)
      yield put(toggleAssetPack(project, defaultSelection, true))
      selectedAssetPackIds = new Set(defaultSelection)
    }

    // Get asset pack list
    const assetPacks: FullAssetPack[] = []

    for (const remoteAssetPack of remoteAssetPacks) {
      // Check if the asset pack is selected
      if (selectedAssetPackIds.has(remoteAssetPack.id)) {
        const assetPacksInState: ReturnType<typeof getAssetPacks> = yield select(getAssetPacks)
        const assetPackInState = assetPacksInState[remoteAssetPack.id]
        // Check if the asset pack not in the state or is not loaded and if so, fetch it
        if (!assetPackInState || !assetPackInState.isLoaded) {
          const assetPack: FullAssetPack = yield call(() => api.fetchAssetPack(remoteAssetPack.id))
          assetPacks.push({
            // Add the fetched asset pack and mark it as loaded
            ...assetPack,
            isLoaded: true,
            assets: assetPack.assets.map(asset => ({
              ...asset,
              url: `${remoteAssetPack.id}/${asset.url}`,
              assetPackId: remoteAssetPack.id,
              id: asset.id
            }))
          })
        } else {
          // If the asset pack is already loaded use the data from state
          const assetsInState: ReturnType<typeof getAssets> = yield select(getAssets)
          assetPacks.push({
            ...assetPackInState,
            assets: assetPackInState.assets.map(assetId => assetsInState[assetId])
          })
        }
      } else {
        // If the asset pack is not selected then just add the remote asset pack and mark is as not loaded
        assetPacks.push({
          ...remoteAssetPack,
          isLoaded: false,
          assets: []
        })
      }
    }

    // Success
    yield put(loadAssetPacksSuccess(assetPacks))
  } catch (error) {
    yield put(loadAssetPacksFailure(error.message))
  }
}
