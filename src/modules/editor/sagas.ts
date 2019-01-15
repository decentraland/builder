import { takeLatest, select, put } from 'redux-saga/effects'

import { getCurrentScene } from 'modules/scene/selectors'
import { getAssetMappings } from 'modules/asset/selectors'
import { getData } from 'modules/editor/selectors'
import { writeGLTFComponents, writeEntities } from 'modules/scene/writers'
import { ADD_ENTITY } from 'modules/scene/actions'
import { bindKeyboardShortcuts, unbindKeyboardShortcuts } from 'modules/keyboard/actions'
import {
  updateEditor,
  UpdateEditorAction,
  editorUndo,
  editorRedo,
  BIND_EDITOR_KEYBOARD_SHORTCUTS,
  UNBIND_KEYBOARD_SHORTCUTS,
  START_EDITOR,
  EDITOR_UNDO,
  EDITOR_REDO,
  UPDATE_EDITOR
} from 'modules/editor/actions'
import { getCurrentProject } from 'modules/project/selectors'
import { KeyboardShortcut } from 'modules/keyboard/types'
import { SceneDefinition } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { EditorScene } from 'modules/editor/types'
import { EditorState } from 'modules/editor/reducer'
import { store } from 'modules/common/store'
import { getEditorScene } from './utils'
const ecs = require('raw-loader!decentraland-ecs/dist/src/index')

export function* editorSaga() {
  yield takeLatest(BIND_EDITOR_KEYBOARD_SHORTCUTS, handleBindEditorKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindEditorKeyboardShortcuts)
  yield takeLatest(ADD_ENTITY, handleAddEntity)
  yield takeLatest(START_EDITOR, handleApplyEditorState)
  yield takeLatest(EDITOR_UNDO, handleApplyEditorState)
  yield takeLatest(EDITOR_REDO, handleApplyEditorState)
  yield takeLatest(UPDATE_EDITOR, handleUpdateEditor)
}

function* handleBindEditorKeyboardShortcuts() {
  const shortcuts = getKeyboardShortcuts()
  yield put(bindKeyboardShortcuts(shortcuts))
}

function* handleUnbindEditorKeyboardShortcuts() {
  const shortcuts = getKeyboardShortcuts()
  yield put(unbindKeyboardShortcuts(shortcuts))
}

// This function dispatches actions to the store, but uses `store.dispatch` to scape generators
function getKeyboardShortcuts(): KeyboardShortcut[] {
  return [
    {
      combination: ['command+z', 'ctrl+z'],
      callback: () => store.dispatch(editorUndo())
    },
    {
      combination: ['command+shift+z', 'ctrl+shift+z'],
      callback: () => store.dispatch(editorRedo())
    }
  ]
}

function* handleAddEntity() {
  const scene: SceneDefinition = yield select(getCurrentScene)

  if (scene) {
    const assetMappings = yield select(getAssetMappings)
    const project: Project = yield select(getCurrentProject)

    const entities = scene.entities
    const components = scene.components
    const ownScript = writeGLTFComponents(components) + writeEntities(entities, components)
    const script = ecs + ownScript
    const mappings = {
      'game.js': `data:application/javascript;base64,${btoa(script)}`,
      ...assetMappings
    }

    const newScene: EditorScene = getEditorScene(project.title, mappings)

    yield put(updateEditor(scene.id, newScene))
  } else {
    // TODO: dispatch a proper 404 error message
    console.warn('Invalid scene')
  }
}

function* handleApplyEditorState() {
  const scene: SceneDefinition = yield select(getCurrentScene)

  if (scene) {
    const editorScenes: EditorState['data'] = yield select(getData)
    const editorScene = editorScenes[scene.id]
    yield handleUpdateEditor(updateEditor(scene.id, editorScene))
  }
}

function* handleUpdateEditor(action: UpdateEditorAction) {
  let scene: EditorScene

  if (action.payload.scene) {
    scene = action.payload.scene
  } else {
    const project: Project = yield select(getCurrentProject)
    scene = getEditorScene(project.title)
  }

  const msg = {
    type: 'update',
    payload: {
      scene
    }
  }

  // @ts-ignore: Client api
  window['editor']['handleServerMessage'](msg)
}
