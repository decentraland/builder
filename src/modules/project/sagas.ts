import uuidv4 from 'uuid/v4'
import { push } from 'connected-react-router'
import { takeLatest, put, select, take, call, all, race, delay } from 'redux-saga/effects'
import { ActionCreators } from 'redux-undo'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
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
  loadProjectsFailure,
  loadProjectsRequest,
  loadPublicProjectSuccess,
  loadPublicProjectFailure,
  LoadPublicProjectRequestAction,
  LOAD_PUBLIC_PROJECT_REQUEST,
  ShareProjectAction,
  SHARE_PROJECT,
  EDIT_PROJECT_THUMBNAIL,
  DELETE_PROJECT,
  DeleteProjectAction
} from 'modules/project/actions'
import { Project, Manifest } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { createScene, setGround, applyLayout } from 'modules/scene/actions'
import { SET_EDITOR_READY, setEditorReady, takeScreenshot, setExportProgress, createEditorScene, setGizmo } from 'modules/editor/actions'
import { store } from 'modules/common/store'
import { closeModal } from 'modules/modal/actions'
import { isRemoteURL } from 'modules/media/utils'
import { getSceneByProjectId } from 'modules/scene/utils'
import { BuilderAPI } from 'lib/api/builder'
import { saveProjectRequest } from 'modules/sync/actions'
import { Gizmo } from 'modules/editor/types'
import { Pool } from 'modules/pool/types'
import { loadProfileRequest } from 'decentraland-dapps/dist/modules/profile/actions'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'
import { getName } from 'modules/profile/selectors'
import { locations } from 'routing/locations'
import { getDefaultGroundAsset } from 'modules/deployment/utils'
import { didUpdateLayout, getImageAsDataUrl } from './utils'
import { createFiles } from './export'

export function* projectSaga(builder: BuilderAPI) {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
  yield takeLatest(DUPLICATE_PROJECT, handleDuplicateProject)
  yield takeLatest(EDIT_PROJECT, handleEditProject)
  yield takeLatest(SHARE_PROJECT, handleShareProject)
  yield takeLatest(EXPORT_PROJECT_REQUEST, handleExportProject)
  yield takeLatest(IMPORT_PROJECT, handleImportProject)
  yield takeLatest(LOAD_PUBLIC_PROJECT_REQUEST, handleLoadPublicProject)
  yield takeLatest(LOAD_PROJECTS_REQUEST, handleLoadProjectsRequest)
  yield takeLatest(LOAD_MANIFEST_REQUEST, handleLoadProjectRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(DELETE_PROJECT, handleDeleteProject)

  function* handleCreateProjectFromTemplate(action: CreateProjectFromTemplateAction) {
    const { template } = action.payload
    const { title, description, onSuccess } = action.meta

    const scene: Scene = {
      id: uuidv4(),
      entities: {},
      components: {},
      assets: {},
      metrics: EMPTY_SCENE_METRICS,
      limits: EMPTY_SCENE_METRICS,
      ground: null
    }

    const { rows, cols } = template

    const ethAddress: string = yield select(getAddress)

    const project: Project = {
      id: uuidv4(),
      title: title || t('global.new_scene'),
      description: description || '',
      thumbnail: '',
      isPublic: false,
      layout: {
        rows,
        cols
      },
      sceneId: scene.id,
      ethAddress: ethAddress || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    yield put(createScene(scene))
    yield put(createProject(project))

    if (onSuccess) {
      onSuccess(project, scene)
      yield put(setGround(project.id, getDefaultGroundAsset()))
    }
  }

  function* handleDuplicateProject(action: DuplicateProjectAction) {
    const { project } = action.payload

    const scene: Scene = yield getSceneByProjectId(project.id)

    let thumbnail = project.thumbnail

    if (thumbnail && isRemoteURL(thumbnail)) {
      thumbnail = yield call(() => getImageAsDataUrl(project.thumbnail))
    }

    const newScene = { ...scene, id: uuidv4() }
    const newProject = { ...project, sceneId: newScene.id, id: uuidv4(), createdAt: new Date().toISOString(), thumbnail }

    yield put(createScene(newScene))
    yield put(createProject(newProject))
    yield put(push(locations.root()))
  }

  function* handleEditProject(action: EditProjectAction) {
    const { id, project } = action.payload
    const projects: ReturnType<typeof getProjects> = yield select(getProjects)
    const targetProject = projects[id]

    if (!targetProject || !project) return

    const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
    const scene = scenes[targetProject.sceneId]

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

  function* handleShareProject(action: ShareProjectAction) {
    const { id } = action.payload

    const scene: Scene = yield getSceneByProjectId(id)
    if (!scene) return

    const projects: ReturnType<typeof getProjects> = yield select(getProjects)
    const project = projects[id]
    if (!project) return

    if (!project.isPublic) {
      const newProject = { ...project, isPublic: true }
      yield put(setProject(newProject))
    }
    yield put(setGizmo(Gizmo.NONE))
    yield put(takeScreenshot())
    yield race([take(EDIT_PROJECT_THUMBNAIL), delay(1000)])

    yield put(saveProjectRequest(project, false))
  }

  function* handleExportProject(action: ExportProjectRequestAction) {
    const { project } = action.payload
    const scene: Scene = yield getSceneByProjectId(project.id)

    let zip = new JSZip()
    let sanitizedName = project.title.replace(/\s/g, '_')
    yield put(setExportProgress({ loaded: 0, total: 0 }))
    const author: string = yield select(getName)
    const files: Record<string, Blob | string> = yield call(() =>
      createFiles({
        project,
        scene,
        point: { x: 0, y: 0 },
        rotation: 'east',
        isDeploy: false,
        thumbnail: null,
        author,
        onProgress: progress => store.dispatch(setExportProgress(progress))
      })
    )

    for (const filename of Object.keys(files)) {
      zip.file(filename, files[filename])
    }

    const artifact = yield call(zip.generateAsync, { type: 'blob' })
    saveAs(artifact, `${sanitizedName}.zip`)

    yield put(closeModal('ExportModal'))
    yield put(exportProjectSuccess())
  }

  function* handleImportProject(action: ImportProjectAction) {
    const { projects } = action.payload

    for (let saved of projects) {
      if (saved.scene && saved.project) {
        yield all([put(createScene(saved.scene)), put(createProject({ ...saved.project, ethAddress: yield select(getAddress) }))])
      }
    }
  }

  function* handleLoadPublicProject(action: LoadPublicProjectRequestAction) {
    const { id, type } = action.payload
    try {
      const project: Project | Pool = yield call(() => builder.fetchPublicProject(id, type))
      yield put(loadPublicProjectSuccess(project, type))
      if (project) {
        if (project.ethAddress) {
          yield put(loadProfileRequest(project.ethAddress))
        }
      }
    } catch (e) {
      yield put(loadPublicProjectFailure(e.message))
    }
  }

  function* handleLoadProjectsRequest() {
    try {
      const projects: Project[] = yield call(() => builder.fetchProjects())
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
    const { id, type } = action.payload
    try {
      const manifest: Manifest<Project> = yield call(() => builder.fetchManifest(id, type))
      yield put(loadManifestSuccess(manifest))
    } catch (e) {
      yield put(loadManifestFailure(e.message))
    }
  }

  function* handleLoginSuccess(_action: LoginSuccessAction) {
    yield put(loadProjectsRequest())
  }

  function* handleDeleteProject(_action: DeleteProjectAction) {
    yield put(push(locations.root()))
  }
}
