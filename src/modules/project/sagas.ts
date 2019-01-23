import uuidv4 from 'uuid/v4'
import { takeLatest, put } from 'redux-saga/effects'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { CREATE_PROJECT_FROM_TEMPLATE, CreateProjectFromTemplateAction, createProject } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { SceneDefinition } from 'modules/scene/types'
import { createScene } from 'modules/scene/actions'
import { locations } from 'routing/locations'

export function* projectSaga() {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
}

function* handleCreateProjectFromTemplate(action: CreateProjectFromTemplateAction) {
  const { template } = action.payload

  const scene: SceneDefinition = {
    id: uuidv4(),
    entities: {},
    components: {},
    metrics: {
      entities: 0,
      bodies: 0,
      materials: 0,
      height: 0,
      textures: 0,
      triangles: 0
    }
  }

  const project: Project = {
    id: uuidv4(),
    title: 'Default title',
    description: '',
    thumbnail: '',
    parcelLayout: template.parcelLayout,
    sceneId: scene.id
  }

  yield put(createScene(scene))
  yield put(createProject(project))

  yield put(navigateTo(locations.editor(project.id)))
}
