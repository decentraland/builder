import uuidv4 from 'uuid/v4'
import { Composite } from '@dcl/ecs'
import { push } from 'connected-react-router'
import { createEngineContext, dumpEngineToComposite } from '@dcl/inspector'
import { takeLatest, put, select, take, call, all, race, delay, takeEvery } from 'redux-saga/effects'
import { ActionCreators } from 'redux-undo'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import {
  CREATE_PROJECT_FROM_TEMPLATE,
  CreateProjectFromTemplateAction,
  DUPLICATE_PROJECT_REQUEST,
  DuplicateProjectRequestAction,
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
  DeleteProjectAction,
  loadProjectSceneSuccess,
  loadProjectSceneFailure,
  LoadProjectSceneRequestAction,
  LOAD_PROJECT_SCENE_REQUEST,
  LOAD_TEMPLATES_REQUEST,
  loadTemplatesSuccess,
  loadTemplatesFailure,
  loadTemplatesRequest,
  duplicateProjectSuccess,
  duplicateProjectFailure
} from 'modules/project/actions'
import { Project, Manifest } from 'modules/project/types'
import { SDKVersion, Scene } from 'modules/scene/types'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { EMPTY_SCENE_METRICS } from 'modules/scene/constants'
import { createScene, setGround, applyLayout, updateScene } from 'modules/scene/actions'
import { SET_EDITOR_READY, setEditorReady, takeScreenshot, setExportProgress, createEditorScene, setGizmo } from 'modules/editor/actions'
import { store } from 'modules/common/store'
import { isRemoteURL } from 'modules/media/utils'
import { getSceneByProjectId } from 'modules/scene/utils'
import { BUILDER_SERVER_URL, BuilderAPI } from 'lib/api/builder'
import {
  SAVE_PROJECT_SUCCESS,
  saveProjectRequest,
  SAVE_PROJECT_FAILURE,
  SaveProjectSuccessAction,
  SaveProjectFailureAction
} from 'modules/sync/actions'
import { Gizmo, PreviewType } from 'modules/editor/types'
import { Pool } from 'modules/pool/types'
import { loadProfileRequest } from 'decentraland-dapps/dist/modules/profile/actions'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'
import { changeLayout, getParcels } from 'modules/inspector/utils'
import { setInspectorReloading } from 'modules/inspector/actions'
import { getName } from 'modules/profile/selectors'
import { getDefaultGroundAsset } from 'modules/deployment/utils'
import { locations } from 'routing/locations'
import { downloadZip } from 'lib/zip'
import { didUpdateLayout, getImageAsDataUrl, getTemplate, getTemplates } from './utils'
import { createFiles, createSDK7Files } from './export'
import { getIsSDK7TemplatesEnabled } from 'modules/features/selectors'

export function* projectSaga(builder: BuilderAPI) {
  yield takeLatest(CREATE_PROJECT_FROM_TEMPLATE, handleCreateProjectFromTemplate)
  yield takeLatest(DUPLICATE_PROJECT_REQUEST, handleDuplicateProjectRequest)
  yield takeLatest(EDIT_PROJECT, handleEditProject)
  yield takeLatest(SHARE_PROJECT, handleShareProject)
  yield takeLatest(EXPORT_PROJECT_REQUEST, handleExportProject)
  yield takeLatest(IMPORT_PROJECT, handleImportProject)
  yield takeLatest(LOAD_PUBLIC_PROJECT_REQUEST, handleLoadPublicProject)
  yield takeLatest(LOAD_PROJECTS_REQUEST, handleLoadProjectsRequest)
  yield takeLatest(LOAD_TEMPLATES_REQUEST, handleLoadTemplatesRequest)
  yield takeLatest(LOAD_MANIFEST_REQUEST, handleLoadManifestRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(DELETE_PROJECT, handleDeleteProject)
  yield takeEvery(LOAD_PROJECT_SCENE_REQUEST, handleLoadProjectSceneRequest)

  function* handleCreateProjectFromTemplate(action: CreateProjectFromTemplateAction) {
    const { template } = action.payload
    const { rows, cols } = template
    const { title, description, sdk, onSuccess } = action.meta

    let scene: Scene

    if (sdk === SDKVersion.SDK7) {
      const { engine, components } = createEngineContext()
      components.Scene.createOrReplace(engine.RootEntity, {
        layout: {
          parcels: getParcels({
            rows,
            cols
          }),
          base: {
            x: 0,
            y: 0
          }
        }
      })

      scene = {
        sdk6: null,
        sdk7: {
          id: uuidv4(),
          composite: Composite.toJson(dumpEngineToComposite(engine as any, 'json')),
          mappings: {}
        }
      }
    } else {
      scene = {
        sdk6: {
          id: uuidv4(),
          entities: {},
          components: {},
          assets: {},
          metrics: EMPTY_SCENE_METRICS,
          limits: EMPTY_SCENE_METRICS,
          ground: null
        },
        sdk7: null
      }
    }

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
      sceneId: scene.sdk6 ? scene.sdk6.id : scene.sdk7.id,
      ethAddress: ethAddress || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemplate: false,
      video: null,
      templateStatus: null
    }

    yield put(createScene(scene))
    yield put(createProject(project, sdk))

    if (onSuccess) {
      onSuccess(project, scene)
      yield put(setGround(project.id, getDefaultGroundAsset()))
    }
  }

  function* handleDuplicateProjectRequest(action: DuplicateProjectRequestAction) {
    const { project, type, shouldRedirect } = action.payload
    const isSDK7TemplatesEnabled: boolean = yield select(getIsSDK7TemplatesEnabled)
    const ethAddress: string = yield select(getAddress)
    const scene: Scene = yield getSceneByProjectId(project.id, type)

    let thumbnail: string = project.thumbnail

    try {
      // TODO: remove this when the SDK7_TEMPLATES feature flag is removed
      if (!isSDK7TemplatesEnabled && project.isTemplate) {
        thumbnail = yield call(getImageAsDataUrl, `${BUILDER_SERVER_URL}/projects/${project.id}/media/thumbnail.png`)
      } else if (thumbnail && isRemoteURL(thumbnail)) {
        thumbnail = yield call(getImageAsDataUrl, project.thumbnail)
      }

      const newSceneId = uuidv4()
      const newScene: Scene = scene.sdk6
        ? { sdk6: { ...scene.sdk6, id: newSceneId }, sdk7: null }
        : { sdk7: { ...scene.sdk7, id: newSceneId }, sdk6: null }

      const newProject = {
        ...project,
        ethAddress,
        sceneId: newSceneId,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail,
        isTemplate: false,
        video: null,
        templateStatus: null
      }

      yield put(createScene(newScene))
      yield put(createProject(newProject, scene.sdk6 ? SDKVersion.SDK6 : SDKVersion.SDK7))

      if (project.isTemplate) {
        yield take(SAVE_PROJECT_SUCCESS)
        yield put(push(scene.sdk6 ? locations.sceneEditor(newProject.id) : locations.inspector(newProject.id)))
      } else if (shouldRedirect) {
        yield put(push(locations.scenes()))
      }

      yield put(duplicateProjectSuccess(newProject, type))
    } catch (error) {
      yield put(duplicateProjectFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
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
      if (scene.sdk6) {
        yield put(setEditorReady(false))
        yield put(createEditorScene(newProject))
        yield take(SET_EDITOR_READY)
        yield put(applyLayout(newProject))
        yield put(ActionCreators.clearHistory())
        yield put(takeScreenshot())
      } else if (scene.sdk7) {
        const newScene = changeLayout(scene.sdk7, project.layout!)

        yield put(setInspectorReloading(true))

        yield put(updateScene(newScene))
        const { failure }: { success: SaveProjectSuccessAction | null; failure: SaveProjectFailureAction | null } = yield race({
          success: take(SAVE_PROJECT_SUCCESS),
          failure: take(SAVE_PROJECT_FAILURE)
        })

        yield put(setInspectorReloading(false))

        if (failure) {
          console.error(`Error saving project=${project.id!}`)
        }
      }
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
    const scene: Scene = yield getSceneByProjectId(
      project.id,
      project.isTemplate || project.isPublic ? PreviewType.PUBLIC : PreviewType.PROJECT
    )
    yield put(setExportProgress({ loaded: 0, total: 0 }))
    let files: Record<string, Blob | string> = {}

    if (scene.sdk6) {
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

    // download zip
    const name = project.title.replace(/\s/g, '_')
    yield call(downloadZip, name, files)
    yield put(exportProjectSuccess())
  }

  function* handleImportProject(action: ImportProjectAction) {
    const { projects } = action.payload

    for (const saved of projects) {
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
      const isSDK7TemplatesEnabled: boolean = yield select(getIsSDK7TemplatesEnabled)
      if (isSDK7TemplatesEnabled && type === PreviewType.TEMPLATE) {
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
      const isSDK7TemplatesEnabled: boolean = yield select(getIsSDK7TemplatesEnabled)
      if (isSDK7TemplatesEnabled && type === PreviewType.TEMPLATE) {
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
      const isSDK7TemplatesEnabled: boolean = yield select(getIsSDK7TemplatesEnabled)
      const projects: Project[] = isSDK7TemplatesEnabled
        ? ((yield call(getTemplates)) as Manifest[]).map(template => template.project)
        : yield call([builder, 'fetchTemplates'])
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
    yield put(push(locations.scenes()))
  }
}
