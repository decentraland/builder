import uuidv4 from 'uuid/v4'
import { takeLatest, put, select, take } from 'redux-saga/effects'

import {
  CREATE_PROJECT_FROM_TEMPLATE,
  CreateProjectFromTemplateAction,
  createProject,
  DUPLICATE_PROJECT,
  DuplicateProjectAction,
  EDIT_PROJECT_REQUEST,
  EditProjectRequestAction,
  editProjectSuccess,
  editProjectFailure
} from 'modules/project/actions'
import { RootState } from 'modules/common/types'
import { Project, Layout } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { getProject } from 'modules/project/selectors'
import { getData as getScenes, getScene, getCurrentScene } from 'modules/scene/selectors'
import { getGroundAsset } from 'modules/asset/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { createScene, setGround, provisionScene } from 'modules/scene/actions'
import { newEditorScene, SET_EDITOR_READY, setEditorReady, resetCamera, takeScreenshot } from 'modules/editor/actions'
import { getBlockchainParcelsFromLayout, isEqualLayout } from './utils'

export function* projectSaga() {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
  yield takeLatest(DUPLICATE_PROJECT, handleDuplicateProject)
  yield takeLatest(EDIT_PROJECT_REQUEST, handleEditProject)
}

function* handleCreateProjectFromTemplate(action: CreateProjectFromTemplateAction) {
  const { template } = action.payload
  const { onSuccess } = action.meta

  const scene: Scene = {
    id: uuidv4(),
    entities: {},
    components: {},
    metrics: EMPTY_SCENE_METRICS,
    limits: EMPTY_SCENE_METRICS,
    ground: null
  }

  const layout: Layout = template.layout!

  const project: Project = {
    id: uuidv4(),
    title: 'New project',
    description: '',
    thumbnail: '',
    layout,
    parcels: getBlockchainParcelsFromLayout(layout),
    sceneId: scene.id,
    createdAt: Date.now()
  }

  yield put(createScene(scene))
  yield put(createProject(project))

  if (onSuccess) {
    onSuccess(project, scene)
  }
}

function* handleDuplicateProject(action: DuplicateProjectAction) {
  const { project } = action.payload

  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const scene = scenes[project.sceneId]
  if (!scene) return

  const newScene = { ...scene, id: uuidv4() }
  const newProject = { ...project, sceneId: newScene.id, id: uuidv4(), createdAt: Date.now() }

  yield put(createScene(newScene))
  yield put(createProject(newProject))
}

function* handleEditProject(action: EditProjectRequestAction) {
  const { id, project } = action.payload
  let ground = action.payload.ground

  const currentProject: ReturnType<typeof getProject> = yield select((state: RootState) => getProject(state, id))
  if (!currentProject) return

  const scene: ReturnType<typeof getScene> = yield select((state: RootState) => getScene(state, currentProject.sceneId))
  if (!scene) return

  const hasNewLayout = project.layout && !isEqualLayout(project.layout, currentProject.layout)
  try {
    if (hasNewLayout) {
      yield put(setEditorReady(false))
      yield put(newEditorScene(id, project))

      yield take(SET_EDITOR_READY)

      if (!ground && scene.ground) {
        const groundId = scene.ground.assetId
        ground = yield select((state: RootState) => getGroundAsset(state, groundId))
      }

      yield put(provisionScene(scene))
    }

    if (ground) {
      yield put(setGround(id, project.layout, ground))
    }

    yield put(editProjectSuccess(id, project))

    if (hasNewLayout) {
      // The user could've navigated away, we need to compensate for this
      const currentScene: ReturnType<typeof getCurrentScene> = yield select(getCurrentScene)

      if (!currentScene) {
        yield put(setEditorReady(false))
      } else if (currentScene.id === currentProject.sceneId) {
        yield put(resetCamera())
        yield put(takeScreenshot())
      }
    }
  } catch (error) {
    yield put(editProjectFailure(error))
  }
}
