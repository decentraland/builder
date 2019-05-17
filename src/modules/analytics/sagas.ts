import { takeLatest, select } from 'redux-saga/effects'
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

export function* segmentSaga() {
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(ADD_ITEM, handleNewItem)
  yield takeLatest(DUPLICATE_ITEM, handleNewItem)
  yield takeLatest(SET_GROUND, handleNewItem)
  yield takeLatest(DELETE_ITEM, handleDeleteItem)
  yield takeLatest(TOGGLE_SNAP_TO_GRID, handleToggleSnapToGrid)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWallet)
}

const track = (event: string, params: any) => getAnalytics().track(event, params)

function* handleOpenEditor(_: OpenEditorAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  track('Open project', { projectId: project.id })
}

function* handleNewItem(_: AddItemAction | DuplicateItemAction | SetGroundAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

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
