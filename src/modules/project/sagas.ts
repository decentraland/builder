import uuidv4 from 'uuid/v4'
import { takeLatest, put, select } from 'redux-saga/effects'

import {
  CREATE_PROJECT_FROM_TEMPLATE,
  CreateProjectFromTemplateAction,
  createProject,
  DUPLICATE_PROJECT,
  DuplicateProjectAction
} from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { createScene } from 'modules/scene/actions'
import { getBlockchainParcelsFromLayout } from './utils'

export function* projectSaga() {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
  yield takeLatest(DUPLICATE_PROJECT, handleDuplicateProject)
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

  // TODO: This default is here until we have a layout editor for custom built projects
  const parcelLayout = template.parcelLayout || { rows: 2, cols: 4 }

  const project: Project = {
    id: uuidv4(),
    title: 'New project',
    description: '',
    thumbnail: '',
    parcelLayout,
    parcels: getBlockchainParcelsFromLayout(parcelLayout),
    sceneId: scene.id
  }

  yield put(createScene(scene))
  yield put(createProject(project))

  if (onSuccess) {
    onSuccess(project, scene)
  }
}

function* handleDuplicateProject(action: DuplicateProjectAction) {
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const originalProject = projects[action.payload.id]
  if (!originalProject) return

  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const originalScene = scenes[originalProject.sceneId]
  if (!originalScene) return

  const newScene = { ...originalScene, id: uuidv4() }
  const newProject = { ...originalProject, sceneId: newScene.id, id: uuidv4() }

  yield put(createScene(newScene))
  yield put(createProject(newProject))
}
