import { takeLatest, select, fork } from 'redux-saga/effects'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { ConnectWalletSuccessAction, CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'

import { OPEN_EDITOR, OpenEditorAction, TOGGLE_SNAP_TO_GRID, ToggleSnapToGridAction } from 'modules/editor/actions'
import { getCurrentProject } from 'modules/project/selectors'
import {
  ADD_ITEM,
  DUPLICATE_ITEM,
  AddItemAction,
  DuplicateItemAction,
  DeleteItemAction,
  DELETE_ITEM,
  SET_GROUND,
  SetGroundAction,
  UPDATE_TRANSFORM,
  UpdateTransfromAction
} from 'modules/scene/actions'
import {
  DeployToPoolSuccessAction,
  DEPLOY_TO_POOL_SUCCESS,
  DEPLOY_TO_LAND_SUCCESS,
  CLEAR_DEPLOYMENT_SUCCESS,
  DeployToLandSuccessAction,
  ClearDeploymentSuccessAction
} from 'modules/deployment/actions'
import { SEARCH_ASSETS, SearchAssetsAction } from 'modules/ui/sidebar/actions'
import { getSideBarCategories, getSearch } from 'modules/ui/sidebar/selectors'
import { Project } from 'modules/project/types'
import { trimAsset } from './track'
import { handleDelighted } from './delighted'
import { getSub } from 'modules/auth/selectors'

export function* segmentSaga() {
  yield fork(handleDelighted)
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(ADD_ITEM, handleNewItem)
  yield takeLatest(DUPLICATE_ITEM, handleNewItem)
  yield takeLatest(SET_GROUND, handleNewItem)
  yield takeLatest(DELETE_ITEM, handleDeleteItem)
  yield takeLatest(TOGGLE_SNAP_TO_GRID, handleToggleSnapToGrid)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
  yield takeLatest(DEPLOY_TO_POOL_SUCCESS, handleDeployToPoolSuccess)
  yield takeLatest(DEPLOY_TO_LAND_SUCCESS, handleDeployToLandSuccess)
  yield takeLatest(CLEAR_DEPLOYMENT_SUCCESS, handleClearDeploymentSuccess)
  yield takeLatest(SEARCH_ASSETS, handleSearchAssets)
}

const track = (event: string, params: any) => getAnalytics().track(event, params)

function* handleOpenEditor(_: OpenEditorAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  track('Open project', { projectId: project.id })
}

function* handleNewItem(action: AddItemAction | DuplicateItemAction | SetGroundAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  if (action.type === ADD_ITEM) {
    const search: ReturnType<typeof getSearch> = yield select(getSearch)
    track(ADD_ITEM, {
      ...trimAsset(action),
      search
    })
  }

  track('New item', { projectId: project.id })
}

function* handleDeleteItem(_: DeleteItemAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  track('Delete item', { projectId: project.id })
}

let trackedEnablePrecision = false
function* handleToggleSnapToGrid(action: ToggleSnapToGridAction) {
  if (!action.payload.enabled) {
    const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
    if (!project) return

    if (!trackedEnablePrecision) {
      track('Enable precision', { projectId: project.id })
      trackedEnablePrecision = true
    }
  } else {
    trackedEnablePrecision = false
  }
}

function* handleUpdateTransfrom(_: UpdateTransfromAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  track('Update item', { projectId: project.id })
}

function handleConnectWallet(action: ConnectWalletSuccessAction) {
  const ethereum = (window as any)['ethereum']

  let provider = null

  if (ethereum) {
    if (ethereum.isMetaMask) {
      provider = 'metamask'
    } else if (ethereum.isDapper) {
      provider = 'dapper'
    }
  }

  track('Connect wallet', { address: action.payload.wallet.address, provider })
}

function* handleDeployToPoolSuccess(_: DeployToPoolSuccessAction) {
  const project: Project | null = yield select(getCurrentProject)
  if (!project) return
  const userId = yield select(getSub)
  track(DEPLOY_TO_POOL_SUCCESS, { project_id: project.id, user_id: userId })
}

function* handleDeployToLandSuccess(_: DeployToLandSuccessAction) {
  const project: Project | null = yield select(getCurrentProject)
  if (!project) return
  const userId = yield select(getSub)
  track(DEPLOY_TO_LAND_SUCCESS, { project_id: project.id, user_id: userId })
}

function* handleClearDeploymentSuccess(_: ClearDeploymentSuccessAction) {
  const project: Project | null = yield select(getCurrentProject)
  if (!project) return
  const userId = yield select(getSub)
  track(CLEAR_DEPLOYMENT_SUCCESS, { project_id: project.id, user_id: userId })
}

function* handleSearchAssets(action: SearchAssetsAction) {
  const categories: ReturnType<typeof getSideBarCategories> = yield select(getSideBarCategories)
  const hits = categories.reduce<number>((hits, category) => hits + category.assets.length, 0)
  track(SEARCH_ASSETS, { ...action.payload, hits })
}
