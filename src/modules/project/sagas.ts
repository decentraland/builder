import { History } from 'history'
import { takeLatest, put, select, take, call, race, delay, takeEvery, getContext } from 'redux-saga/effects'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import {
  EXPORT_PROJECT_REQUEST,
  ExportProjectRequestAction,
  exportProjectSuccess,
  LOAD_PROJECTS_REQUEST,
  loadProjectsSuccess,
  loadManifestSuccess,
  LOAD_MANIFEST_REQUEST,
  setProject,
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
  DeleteProjectAction,
  loadProjectSceneSuccess,
  loadProjectSceneFailure,
  LoadProjectSceneRequestAction,
  LOAD_PROJECT_SCENE_REQUEST,
  LOAD_TEMPLATES_REQUEST,
  loadTemplatesSuccess,
  loadTemplatesFailure,
  loadTemplatesRequest
} from 'modules/project/actions'
import { Project, Manifest } from 'modules/project/types'
import { Scene, SceneSDK7 } from 'modules/scene/types'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { takeScreenshot, setExportProgress, setGizmo } from 'modules/editor/actions'
import { store } from 'modules/common/store'
import { getSceneByProjectId } from 'modules/scene/utils'
import { BuilderAPI } from 'lib/api/builder'
import { saveProjectRequest } from 'modules/sync/actions'
import { Gizmo, PreviewType } from 'modules/editor/types'
import { Pool } from 'modules/pool/types'
import { loadProfileRequest } from 'decentraland-dapps/dist/modules/profile/actions'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'
import { toComposite, toCrdt, toMappings } from 'modules/inspector/utils'
import { getName } from 'modules/profile/selectors'
import { locations } from 'routing/locations'
import { downloadZip } from 'lib/zip'
import { getTemplate, getTemplates } from './utils'
import { createFiles, createSDK7Files } from './export'

export function* projectSaga(builder: BuilderAPI) {
  yield takeLatest(SHARE_PROJECT, handleShareProject)
  yield takeLatest(EXPORT_PROJECT_REQUEST, handleExportProject)
  yield takeLatest(LOAD_PUBLIC_PROJECT_REQUEST, handleLoadPublicProject)
  yield takeLatest(LOAD_PROJECTS_REQUEST, handleLoadProjectsRequest)
  yield takeLatest(LOAD_TEMPLATES_REQUEST, handleLoadTemplatesRequest)
  yield takeLatest(LOAD_MANIFEST_REQUEST, handleLoadManifestRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(DELETE_PROJECT, handleDeleteProject)
  yield takeEvery(LOAD_PROJECT_SCENE_REQUEST, handleLoadProjectSceneRequest)

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
    const { project, migrateToSDK7 } = action.payload
    const scene: Scene = yield getSceneByProjectId(
      project.id,
      project.isTemplate || project.isPublic ? PreviewType.PUBLIC : PreviewType.PROJECT
    )
    yield put(setExportProgress({ loaded: 0, total: 0 }))
    let files: Record<string, Blob | string> = {}

    if (scene.sdk6 && migrateToSDK7) {
      const sdk7Scene: SceneSDK7 = {
        id: scene.sdk6.id,
        composite: toComposite(scene.sdk6, project),
        mappings: toMappings(scene.sdk6)
      }
      files = yield call(createSDK7Files, {
        project,
        scene: sdk7Scene,
        builderAPI: builder,
        crdt: new Blob([toCrdt(scene.sdk6) as BlobPart])
      })
    } else if (scene.sdk6) {
      const author: string = yield select(getName)
      files = yield call(createFiles, {
        project,
        scene: scene.sdk6,
        point: { x: 0, y: 0 },
        rotation: 'east',
        isDeploy: false,
        thumbnail: null,
        author,
        onProgress: progress => store.dispatch(setExportProgress(progress))
      })
    } else {
      files = yield call(createSDK7Files, { project, scene: scene.sdk7, builderAPI: builder })
    }

    const name = project.title.replace(/\s/g, '_')
    yield call(downloadZip, name, files)
    yield put(exportProjectSuccess())
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
      yield put(loadPublicProjectFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleLoadProjectsRequest() {
    try {
      const projects: Project[] = yield call([builder, 'fetchProjects'])
      const record: ModelById<Project> = {}

      for (const project of projects) {
        record[project.id] = project
      }

      yield put(loadProjectsSuccess(record))
    } catch (e) {
      yield put(loadProjectsFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleLoadProjectSceneRequest(action: LoadProjectSceneRequestAction) {
    const { project, type } = action.payload
    try {
      if (type === PreviewType.TEMPLATE) {
        const template: Manifest = yield call(getTemplate, project.id)
        yield put(loadProjectSceneSuccess(template.scene))
      } else {
        const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
        if (scenes && scenes[project.sceneId]) {
          yield put(loadProjectSceneSuccess(scenes[project.sceneId]))
          return
        }
        const manifest: Manifest<Project> = yield call([builder, 'fetchManifest'], project.id, type)
        yield put(loadProjectSceneSuccess(manifest.scene))
      }
    } catch (e) {
      yield put(loadProjectSceneFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleLoadManifestRequest(action: LoadManifestRequestAction) {
    const { id, type } = action.payload
    try {
      if (type === PreviewType.TEMPLATE) {
        const manifest: Manifest = yield call(getTemplate, id)
        yield put(loadManifestSuccess(manifest))
      } else {
        const manifest: Manifest<Project> = yield call([builder, 'fetchManifest'], id, type)
        yield put(loadManifestSuccess(manifest))
      }
    } catch (e) {
      yield put(loadManifestFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleLoadTemplatesRequest() {
    try {
      const projects: Project[] = ((yield call(getTemplates)) as Manifest[]).map(template => template.project)
      const record: ModelById<Project> = {}

      for (const project of projects) {
        record[project.id] = project
      }

      yield put(loadTemplatesSuccess(record))
    } catch (e) {
      yield put(loadTemplatesFailure(isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }

  function* handleLoginSuccess(_action: LoginSuccessAction) {
    yield put(loadProjectsRequest())
    yield put(loadTemplatesRequest())
  }

  function* handleDeleteProject(_action: DeleteProjectAction) {
    const history: History = yield getContext('history')
    history.push(locations.scenes())
  }
}
