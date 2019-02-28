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
  SetGroundAction
} from 'modules/scene/actions'
import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'
import { RootState } from 'modules/common/types'
import { getScene } from 'modules/scene/selectors'

export function* segmentSaga() {
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
  yield takeLatest(ADD_ITEM, handleAddItem)
  yield takeLatest(DUPLICATE_ITEM, handleDuplicateItem)
  yield takeLatest(SET_GROUND, handleSetGround)
  yield takeLatest(DELETE_ITEM, handleRemoveItem)
  yield takeLatest(SUBMIT_PROJECT_SUCCESS, handleSubmitProject)
  yield takeLatest(TOGGLE_SNAP_TO_GRID, handleToggleSnapToGrid)
}

function* handleOpenEditor(_: OpenEditorAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  getAnalytics().track('Open project', { projectId: project.id })
}

function* handleAddItem(_: AddItemAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  getAnalytics().track('New item', { projectId: project.id })
}

function* handleDuplicateItem(_: DuplicateItemAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  getAnalytics().track('New item', { projectId: project.id })
}

function* handleSetGround(_: SetGroundAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  getAnalytics().track('New item', { projectId: project.id })
}

function* handleRemoveItem(_: DeleteItemAction) {
  const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
  if (!project) return

  getAnalytics().track('Delete item', { projectId: project.id })
}

function* handleSubmitProject(action: SubmitProjectSuccessAction) {
  const project: ReturnType<typeof getProject> = yield select((state: RootState) => getProject(state, action.payload.projectId))
  if (!project) return

  const scene: ReturnType<typeof getScene> = yield select((state: RootState) => getScene(state, project.sceneId))
  if (!scene) return

  const { email, ethAddress } = action.payload.contest
  getAnalytics().track('Submit project', {
    projectId: project.id,
    email,
    ethAddress,
    numEntities: Object.keys(scene.entities).length,
    layout: project.layout
  })
}

function* handleToggleSnapToGrid(action: ToggleSnapToGridAction) {
  if (!action.payload.enabled) {
    const project: ReturnType<typeof getCurrentProject> = yield select(getCurrentProject)
    if (!project) return

    getAnalytics().track('Enable precision', { projectId: project.id })
  }
}
