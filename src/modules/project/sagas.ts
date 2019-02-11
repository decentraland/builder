import uuidv4 from 'uuid/v4'
import { takeLatest, put } from 'redux-saga/effects'

import { CREATE_PROJECT_FROM_TEMPLATE, CreateProjectFromTemplateAction, createProject } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { getBlockchainParcelsFromLayout } from './utils'
import { provisionScene } from 'modules/scene/actions'

export function* projectSaga() {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
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

  yield put(provisionScene(scene))
  yield put(createProject(project))

  if (onSuccess) {
    onSuccess(project, scene)
  }
}
