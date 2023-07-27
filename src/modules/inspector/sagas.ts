/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects'
import { future, IFuture } from 'fp-future'
import { hashV1 } from '@dcl/hashing'
import { LoginFailureAction, LoginSuccessAction, LOGIN_FAILURE, LOGIN_SUCCESS } from 'modules/identity/actions'
import { isLoggingIn } from 'modules/identity/selectors'
import { getProjectId } from 'modules/location/utils'
import {
  LoadProjectSceneFailureAction,
  loadProjectSceneRequest,
  LoadProjectSceneSuccessAction,
  LoadProjectsFailureAction,
  loadProjectsRequest,
  LoadProjectsSuccessAction,
  LOAD_PROJECTS_FAILURE,
  LOAD_PROJECTS_REQUEST,
  LOAD_PROJECTS_SUCCESS,
  LOAD_PROJECT_SCENE_FAILURE,
  LOAD_PROJECT_SCENE_SUCCESS
} from 'modules/project/actions'
import { getCurrentProject, getData as getProjects, getLoading as getLoadingProjects } from 'modules/project/selectors'
import { getCurrentScene } from 'modules/scene/selectors'
import {
  ConnectInspectorAction,
  CONNECT_INSPECTOR,
  OpenInspectorAction,
  OPEN_INSPECTOR,
  rpcFailure,
  RPCFailureAction,
  rpcRequest,
  RPCRequestAction,
  rpcSuccess,
  RPCSuccessAction,
  RPC_FAILURE,
  RPC_REQUEST,
  RPC_SUCCESS
} from './actions'
import { Project } from 'modules/project/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { IframeStorage, MessageTransport } from '@dcl/inspector'
import { getParcels } from './utils'
import { getContentsStorageUrl } from 'lib/api/builder'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { Scene, SceneSDK7 } from 'modules/scene/types'
import { updateScene } from 'modules/scene/actions'
import { RootStore } from 'modules/common/types'

let nonces = 0
const getNonce = () => nonces++
const promises = new Map<number, IFuture<unknown>>()

// TODO: delete this, use builder-server
const FILES = new Map<string, Buffer>()

export function* inspectorSaga(store: RootStore) {
  yield takeEvery(OPEN_INSPECTOR, handleOpenInspector)
  yield takeEvery(CONNECT_INSPECTOR, handleConnectInspector)
  yield takeEvery(RPC_REQUEST, handleRpcRequest)
  yield takeEvery(RPC_SUCCESS, handleRpcSuccess)
  yield takeEvery(RPC_FAILURE, handleRpcFailure)

  function* handleOpenInspector(_action: OpenInspectorAction) {
    try {
      const projectId = getProjectId()
      if (!projectId) {
        throw new Error(`Invalid projectId=${projectId}`)
      }
      const loggingIn: boolean = yield select(isLoggingIn)
      if (loggingIn) {
        const result: { success?: LoginSuccessAction; failure?: LoginFailureAction } = yield race({
          success: take(LOGIN_SUCCESS),
          failure: take(LOGIN_FAILURE)
        })

        if (result.failure) {
          throw new Error('Could not load login')
        }
      }

      const project: Project = yield getProject(projectId)

      yield put(loadProjectSceneRequest(project))

      const result: { success?: LoadProjectSceneSuccessAction; failure?: LoadProjectSceneFailureAction } = yield race({
        success: take(LOAD_PROJECT_SCENE_SUCCESS),
        failure: take(LOAD_PROJECT_SCENE_FAILURE)
      })

      if (result.failure) {
        throw new Error('Could not load scene')
      }
    } catch (error) {
      console.error(error)
    }
  }

  function handleConnectInspector(action: ConnectInspectorAction) {
    const { iframeId } = action.payload

    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
    if (iframe === null) {
      throw new Error(`Iframe with id="${iframeId}" not found`)
    }

    const transport = new MessageTransport(window, iframe.contentWindow!, '*')
    const storage = new IframeStorage.Server(transport)

    const methods = Object.keys(handlers) as (keyof typeof handlers)[]
    for (const method of methods) {
      storage.handle(method, params => {
        const nonce = getNonce()
        const action = rpcRequest(method, params, nonce)
        const promise = future()
        promises.set(nonce, promise)
        store.dispatch(action)
        return promise
      })
    }
  }

  function* handleRpcRequest(action: RPCRequestAction) {
    const { method, params, nonce } = action.payload
    try {
      const handler = handlers[method]
      const result: IframeStorage.Result[IframeStorage.Method] = yield handler(params)
      yield put(rpcSuccess(method, result, nonce))
    } catch (error) {
      yield put(rpcFailure(method, params, error.message, nonce))
    }
  }

  function handleRpcSuccess(action: RPCSuccessAction) {
    const { result, nonce } = action.payload
    const promise = promises.get(nonce)
    if (promise) {
      promise.resolve(result)
    }
  }

  function handleRpcFailure(action: RPCFailureAction) {
    const { error, nonce } = action.payload
    const promise = promises.get(nonce)
    if (promise) {
      promise.reject(new Error(error))
    }
  }

  // HANDLERS

  const handlers: Record<`${IframeStorage.Method}`, (params: any) => Generator> = {
    read_file: handleReadFile,
    exists: handleExists,
    list: handleList,
    write_file: handleWriteFile,
    delete: handleDelete
  }

  function* handleReadFile(params: IframeStorage.Params['read_file']) {
    const { path } = params

    const scene: SceneSDK7 = yield getScene()

    // TODO: this should be fetched from the builder-server
    if (FILES.has(path)) {
      return FILES.get(path)
    }

    if (path in scene.mappings) {
      const hash = scene.mappings[path]
      const response: Response = yield call(fetch, `https://builder-api.decentraland.org/v1/storage/contents/${hash}`)
      const buffer: ArrayBuffer = yield call([response, 'arrayBuffer'])
      return Buffer.from(buffer)
    }

    let file = ''
    switch (path) {
      case 'scene.json': {
        const project: Project = yield select(getCurrentProject)
        file = JSON.stringify({
          scene: {
            parcels: getParcels(project.layout).map($ => `${$.x},${$.y}`),
            base: '0,0'
          }
        })
        break
      }
      case 'assets/scene/main.composite': {
        file = JSON.stringify(scene.composite)
        break
      }
      case 'inspector-preferences.json': {
        file = JSON.stringify({
          version: 1,
          data: {
            freeCameraInvertRotation: false,
            autosaveEnabled: true
          }
        })
        break
      }
    }
    const buffer = Buffer.from(file, 'utf-8')
    return buffer
  }

  function* handleExists(params: IframeStorage.Params['exists']) {
    const { path } = params
    switch (path) {
      case 'scene.json':
      case 'assets/scene/main.composite':
      case 'inspector-preferences.json': {
        return true
      }
      default: {
        const scene: SceneSDK7 = yield getScene()
        return path in scene.mappings
      }
    }
  }

  function* handleList(params: IframeStorage.Params['list']) {
    const { path } = params

    const scene: SceneSDK7 = yield getScene()
    const paths = [...Object.keys(scene.mappings), 'assets/scene/main.composite']
    const files: { name: string; isDirectory: boolean }[] = []

    for (const _path of paths) {
      if (!_path.startsWith(path)) continue

      const fileName = _path.substring(path.length)
      const slashPosition = fileName.indexOf('/')
      if (slashPosition !== -1) {
        const directoryName = fileName.substring(0, slashPosition)
        if (!files.find(item => item.name === directoryName)) {
          files.push({ name: directoryName, isDirectory: true })
        }
      } else {
        files.push({ name: fileName, isDirectory: false })
      }
    }

    return files
  }

  function* handleWriteFile(params: IframeStorage.Params['write_file']) {
    const { path, content } = params

    switch (path) {
      case 'scene.json': {
        // TODO: some changes to the scene.json might eventually end up in changes to the Project, like the name or the layout, but for now we can ignore it
        break
      }
      case 'assets/scene/main.composite': {
        const scene: SceneSDK7 = yield getScene()
        const newScene: SceneSDK7 = {
          ...scene,
          composite: JSON.parse(new TextDecoder().decode(content))
        }
        yield put(updateScene(newScene))
        break
      }
      case 'inspector-preferences.json': {
        break
      }
      default: {
        const hash: string = yield call(hashV1, content)

        const res: Response = yield call(fetch, getContentsStorageUrl(hash), { headers: NO_CACHE_HEADERS })
        if (!res.ok) {
          // TODO: remove this, use builder-server
          FILES.set(path, content)
        }

        const scene: SceneSDK7 = yield getScene()
        const newScene: SceneSDK7 = {
          ...scene,
          mappings: {
            ...scene.mappings,
            [path]: hash
          }
        }

        yield put(updateScene(newScene))
      }
    }
  }

  function* handleDelete(params: IframeStorage.Params['delete']) {
    const { path } = params

    const scene: SceneSDK7 = yield getScene()

    FILES.delete(path)

    if (path in scene.mappings) {
      const newMappings = { ...scene.mappings }
      delete newMappings[path]
      const newScene: SceneSDK7 = {
        ...scene,
        mappings: newMappings
      }
      yield put(updateScene(newScene))
    }
  }

  // UTILS

  function* getProject(projectId: string): any {
    // grab projects from store
    const projects: Record<string, Project> = yield select(getProjects)
    const project = projects[projectId]

    // if project is found in store, return it
    if (project) {
      return project
    }

    // if project is not in the store, check if projects are being loaded
    const projectsLoadingState: ReturnType<typeof getLoadingProjects> = yield select(getLoadingProjects)
    const isLoading = isLoadingType(projectsLoadingState, LOAD_PROJECTS_REQUEST)

    // if projects are not being loaded, then request them
    if (!isLoading) {
      yield put(loadProjectsRequest())
    }

    // wait for projects to be loaded
    const result: { success?: LoadProjectsSuccessAction; failure?: LoadProjectsFailureAction } = yield race({
      success: take(LOAD_PROJECTS_SUCCESS),
      failure: take(LOAD_PROJECTS_FAILURE)
    })

    // if load is successful try getting the project again
    if (result.success) {
      const _project: Project = yield getProject(projectId)
      return _project
    }

    // if load fails then throw
    if (result.failure) {
      console.error(result.failure)
      throw new Error(`Could not load project`)
    }
  }

  function* getScene() {
    const project: Project = yield select(getCurrentProject)

    if (!project) {
      throw new Error('Invalid project')
    }

    const scene: Scene | null = yield select(getCurrentScene)

    if (!scene) {
      throw new Error('Invalid scene')
    }

    if (!scene.sdk7) {
      throw new Error('Scene must be SDK7')
    }

    return scene.sdk7
  }
}
