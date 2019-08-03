import uuidv4 from 'uuid/v4'
import { ActionCreators } from 'redux-undo'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { takeLatest, put, select, take, call } from 'redux-saga/effects'

import {
  CREATE_PROJECT_FROM_TEMPLATE,
  CreateProjectFromTemplateAction,
  DUPLICATE_PROJECT,
  DuplicateProjectAction,
  EXPORT_PROJECT_REQUEST,
  ExportProjectRequestAction,
  IMPORT_PROJECT,
  ImportProjectAction,
  exportProjectSuccess,
  LOAD_PROJECTS_REQUEST,
  loadProjectsSuccess,
  loadManifestSuccess,
  LOAD_MANIFEST_REQUEST,
  EDIT_PROJECT,
  setProject,
  EditProjectAction,
  createProject,
  LoadManifestRequestAction,
  loadManifestFailure,
  loadProjectsFailure
} from 'modules/project/actions'
import { api } from 'lib/api'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes, getScene } from 'modules/scene/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { createScene, setGround, applyLayout } from 'modules/scene/actions'
import { SET_EDITOR_READY, setEditorReady, takeScreenshot, setExportProgress, createEditorScene } from 'modules/editor/actions'
import { Asset } from 'modules/asset/types'
import { store } from 'modules/common/store'
import { closeModal } from 'modules/modal/actions'
import { AUTH_SUCCESS } from 'modules/auth/actions'
import { createFiles } from './export'
import { didUpdateLayout } from './utils'
import { getSub } from 'modules/auth/selectors'

const DEFAULT_GROUND_ASSET: Asset = {
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

export function* projectSaga() {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
  yield takeLatest(DUPLICATE_PROJECT, handleDuplicateProject)
  yield takeLatest(EDIT_PROJECT, handleEditProject)
  yield takeLatest(EXPORT_PROJECT_REQUEST, handleExportProject)
  yield takeLatest(IMPORT_PROJECT, handleImportProject)
  yield takeLatest(LOAD_PROJECTS_REQUEST, handleLoadProjectsRequest)
  yield takeLatest(AUTH_SUCCESS, handleLoadProjectsRequest)
  yield takeLatest(LOAD_MANIFEST_REQUEST, handleLoadProjectRequest)
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

  const { rows, cols } = template

  const project: Project = {
    id: uuidv4(),
    title: 'New scene', // TODO translate this into different languages
    description: '',
    thumbnail: '',
    rows,
    cols,
    sceneId: scene.id,
    userId: yield select(getSub),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  yield put(createScene(scene))
  yield put(createProject(project))

  if (onSuccess) {
    onSuccess(project, scene)
    yield put(setGround(project.id, DEFAULT_GROUND_ASSET))
  }
}

function* handleDuplicateProject(action: DuplicateProjectAction) {
  const { project } = action.payload

  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const scene = scenes[project.sceneId]
  if (!scene) return

  const newScene = { ...scene, id: uuidv4() }
  const newProject = { ...project, sceneId: newScene.id, id: uuidv4(), createdAt: new Date().toISOString() }

  yield put(createScene(newScene))
  yield put(createProject(newProject))
}

function* handleEditProject(action: EditProjectAction) {
  const { id, project } = action.payload
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const targetProject = projects[id]

  if (!targetProject || !project) return

  const scene: Scene | null = yield select(getScene(targetProject.sceneId))

  if (!scene) return

  const shouldApplyLayout = didUpdateLayout(project, targetProject)
  const newProject = { ...targetProject, ...project }

  yield put(setProject(newProject))

  if (shouldApplyLayout) {
    yield put(setEditorReady(false))
    yield put(createEditorScene(newProject))
    yield take(SET_EDITOR_READY)
    yield put(applyLayout(newProject))
    yield put(ActionCreators.clearHistory())
    yield put(takeScreenshot())
  }
}

function* handleExportProject(action: ExportProjectRequestAction) {
  const { project } = action.payload
  const scene: Scene = yield select(getScene(project.sceneId))

  let zip = new JSZip()
  let sanitizedName = project.title.replace(/\s/g, '_')
  yield put(setExportProgress({ loaded: 0, total: 0 }))
  const files = yield call(() =>
    createFiles({
      project,
      scene,
      point: { x: 0, y: 0 },
      rotation: 'east',
      onProgress: progress => store.dispatch(setExportProgress(progress))
    })
  )

  for (const filename of Object.keys(files)) {
    zip.file(filename, files[filename as keyof typeof files])
  }

  yield call(async () => {
    const artifact = await zip.generateAsync<'blob'>({ type: 'blob' })
    saveAs(artifact, `${sanitizedName}.zip`)
  })

  yield put(closeModal('ExportModal'))
  yield put(exportProjectSuccess())
}

function* handleImportProject(action: ImportProjectAction) {
  const { projects } = action.payload

  for (let saved of projects) {
    if (saved.scene && saved.project) {
      yield put(createScene(saved.scene))
      yield put(createProject(saved.project))
    }
  }
}

function* handleLoadProjectsRequest() {
  try {
    const projects: Project[] = yield call(() => api.fetchProjects())
    const record: ModelById<Project> = {}

    for (let project of projects) {
      record[project.id] = project
    }

    yield put(loadProjectsSuccess(record))
  } catch (e) {
    yield put(loadProjectsFailure(e.message))
  }
}

function* handleLoadProjectRequest(action: LoadManifestRequestAction) {
  try {
    const manifest = yield call(() => api.fetchManifest(action.payload.id))
    yield put(loadManifestSuccess(manifest))
  } catch (e) {
    yield put(loadManifestFailure(e.message))
  }
}
