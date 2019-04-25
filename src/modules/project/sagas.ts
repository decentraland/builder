import uuidv4 from 'uuid/v4'
import { ActionCreators } from 'redux-undo'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { takeLatest, put, select, take, call } from 'redux-saga/effects'

import {
  CREATE_PROJECT_FROM_TEMPLATE,
  CreateProjectFromTemplateAction,
  createProject,
  DUPLICATE_PROJECT,
  DuplicateProjectAction,
  EDIT_PROJECT_REQUEST,
  EditProjectRequestAction,
  editProjectSuccess,
  editProjectFailure,
  EXPORT_PROJECT,
  ExportProjectAction,
  IMPORT_PROJECT,
  ImportProjectAction
} from 'modules/project/actions'
import { RootState } from 'modules/common/types'
import { Project, Layout, SaveFile } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { getProject } from 'modules/project/selectors'
import { getData as getScenes, getScene, getCurrentScene, getSceneById } from 'modules/scene/selectors'
import { getGroundAsset } from 'modules/asset/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { createScene, setGround, provisionScene } from 'modules/scene/actions'
import { newEditorScene, SET_EDITOR_READY, setEditorReady, resetCamera, takeScreenshot } from 'modules/editor/actions'
import { getBlockchainParcelsFromLayout, isEqualLayout } from './utils'

const DEFAULT_GROUND_ASSET = {
  id: 'da1fed3c954172146414a66adfa134f7a5e1cb49c902713481bf2fe94180c2cf',
  name: 'Bermuda Grass',
  thumbnail: 'https://cnhost.decentraland.org/QmexuPHcbEtQCR11dPXxKZmRjGuY4iTooPJYfST7hW71DE',
  url: 'e6fa9601-3e47-4dff-9a84-e8e017add15a/FloorBaseGrass_01/FloorBaseGrass_01.glb',
  tags: ['ground'],
  category: 'ground',
  variations: [],
  contents: {
    'FloorBaseGrass_01/FloorBaseGrass_01.glb': 'QmSyvWnb5nKCaGHw9oHLSkwywvS5NYpj6vgb8L121kWveS',
    'FloorBaseGrass_01/Floor_Grass01.png.png': 'QmT1WfQPMBVhgwyxV5SfcfWivZ6hqMCT74nxdKXwyZBiXb',
    'FloorBaseGrass_01/thumbnail.png': 'QmexuPHcbEtQCR11dPXxKZmRjGuY4iTooPJYfST7hW71DE'
  },
  assetPackId: 'e6fa9601-3e47-4dff-9a84-e8e017add15a'
}

export const BUILDER_FILE_NAME = 'builder.json'

export function* projectSaga() {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
  yield takeLatest(DUPLICATE_PROJECT, handleDuplicateProject)
  yield takeLatest(EDIT_PROJECT_REQUEST, handleEditProject)
  yield takeLatest(EXPORT_PROJECT, handleExportProject)
  yield takeLatest(IMPORT_PROJECT, handleImportProject)
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
    title: 'New scene',
    description: '',
    thumbnail: '',
    assetPackIds: [],
    layout,
    parcels: getBlockchainParcelsFromLayout(layout),
    sceneId: scene.id,
    createdAt: Date.now()
  }

  yield put(createScene(scene))
  yield put(createProject(project))

  if (onSuccess) {
    onSuccess(project, scene)
    yield put(setGround(project.id, project.layout, DEFAULT_GROUND_ASSET))
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
        yield put(ActionCreators.clearHistory())
        yield put(resetCamera())
        yield put(takeScreenshot())
      }
    }
  } catch (error) {
    yield put(editProjectFailure(error))
  }
}

function* handleExportProject(action: ExportProjectAction) {
  const { project } = action.payload
  const scene: Scene = yield select(getSceneById(project.sceneId))

  let zip = new JSZip()
  let sanitizedName = project.title.replace(/\s/g, '_')

  zip.file(BUILDER_FILE_NAME, JSON.stringify({ project, scene } as SaveFile, null, 2))

  yield call(async () => {
    const artifact = await zip.generateAsync<'blob'>({ type: 'blob' })
    saveAs(artifact, `${sanitizedName}.zip`)
  })
}

function* handleImportProject(action: ImportProjectAction) {
  const { projects } = action.payload

  for (let saved of projects) {
    if (saved.scene && saved.project) {
      yield put(createProject(saved.project))
      yield put(createScene(saved.scene))
    }
  }
}
