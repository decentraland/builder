import uuidv4 from 'uuid/v4'
import { takeLatest, put } from 'redux-saga/effects'

import { CREATE_PROJECT_FROM_TEMPLATE, CreateProjectFromTemplateAction, createProject } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { SceneDefinition } from 'modules/scene/types'
import { createScene } from 'modules/scene/actions'

export function* projectSaga() {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
}

function* handleCreateProjectFromTemplate(action: CreateProjectFromTemplateAction) {
  const { template } = action.payload
  const { onSuccess } = action.meta

  const defaultMetrics = {
    triangles: 0,
    materials: 0,
    geometries: 0,
    bodies: 0,
    entities: 0,
    textures: 0,
    height: 0
  }
  const scene: SceneDefinition = {
    id: uuidv4(),
    entities: {},
    components: {},
    metrics: defaultMetrics,
    limits: defaultMetrics
  }

  const project: Project = {
    id: uuidv4(),
    title: 'Default title',
    description: '',
    thumbnail: '',
    parcelLayout: template.parcelLayout || { rows: 2, cols: 4 }, // TODO: This default is here until we have a layout editor for custom built projects
    sceneId: scene.id
  }

  yield put(createScene(scene))
  yield put(createProject(project))

  if (onSuccess) {
    onSuccess(project, scene)
  }
}
