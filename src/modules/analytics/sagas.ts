import { takeLatest, select } from 'redux-saga/effects'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { OPEN_EDITOR, OpenEditorAction, TOGGLE_SNAP_TO_GRID, ToggleSnapToGridAction } from 'modules/editor/actions'
import { getCurrentProject, getProject } from 'modules/project/selectors'
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
import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'
import { RootState } from 'modules/common/types'
import { getScene } from 'modules/scene/selectors'

export function* segmentSaga() {
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(ADD_ITEM, handleNewItem)
  yield takeLatest(DUPLICATE_ITEM, handleNewItem)
  yield takeLatest(SET_GROUND, handleNewItem)
  yield takeLatest(DELETE_ITEM, handleRemoveItem)
  yield takeLatest(SUBMIT_PROJECT_SUCCESS, handleSubmitProject)
  yield takeLatest(TOGGLE_SNAP_TO_GRID, handleToggleSnapToGrid)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
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

function* handleRemoveItem(_: DeleteItemAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  track('Delete item', { projectId: project.id })
}

function* handleSubmitProject(action: SubmitProjectSuccessAction) {
  const project: ReturnType<typeof getProject> = yield select((state: RootState) => getProject(state, action.payload.projectId))
  if (!project) return

  const scene: ReturnType<typeof getScene> = yield select((state: RootState) => getScene(state, project.sceneId))
  if (!scene) return

  const { email, ethAddress } = action.payload.contest
  track('Submit project', {
    projectId: project.id,
    email,
    ethAddress,
    entitiesAmount: Object.keys(scene.entities).length,
    layout: project.layout
  })
}

function* handleToggleSnapToGrid(action: ToggleSnapToGridAction) {
  if (!action.payload.enabled) {
    const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
    if (!project) return

    track('Enable precision', { projectId: project.id })
  }
}

function* handleUpdateTransfrom(_: UpdateTransfromAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  track('Update item', { projectId: project.id })
}
