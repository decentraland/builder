/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { put, race, select, take, takeEvery } from 'redux-saga/effects'
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
import { getData as getProjects, getLoading as getLoadingProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { ConnectInspectorAction, CONNECT_INSPECTOR, OpenInspectorAction, OPEN_INSPECTOR } from './actions'
import { Project } from 'modules/project/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { IframeStorage, MessageTransport } from '@dcl/inspector'
import { getParcels, toComposite, toMappings } from './utils'

export function* inspectorSaga() {
  yield takeEvery(OPEN_INSPECTOR, handleOpenInspector)
  yield takeEvery(CONNECT_INSPECTOR, handleConnectInspector)
}

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
    {
      const result: { success?: LoadProjectSceneSuccessAction; failure?: LoadProjectSceneFailureAction } = yield race({
        success: take(LOAD_PROJECT_SCENE_SUCCESS),
        failure: take(LOAD_PROJECT_SCENE_FAILURE)
      })
      if (result.failure) {
        throw new Error('Could not load scene')
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function* handleConnectInspector(action: ConnectInspectorAction) {
  const { iframeId } = action.payload

  const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
  if (iframe === null) {
    throw new Error(`Iframe with id="${iframeId}" not found`)
  }

  const projectId = getProjectId()
  if (!projectId) {
    throw new Error(`Invalid projectId=${projectId}`)
  }

  const project: Project = yield getProject(projectId)
  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const scene = scenes[project.sceneId]

  const composite = scene.sdk7 ? scene.sdk7.composite : toComposite(scene.sdk6, project)
  const mappings = scene.sdk7 ? scene.sdk7.mappings : toMappings(scene.sdk6)

  const transport = new MessageTransport(window, iframe.contentWindow!, '*')
  const server = new IframeStorage.Server(transport)

  function getFile(path: string) {
    switch (path) {
      case 'scene.json': {
        return JSON.stringify({
          scene: {
            parcels: getParcels(project.layout).map($ => `${$.x},${$.y}`),
            base: '0,0'
          }
        })
      }
      case 'assets/scene/main.composite': {
        return JSON.stringify(composite)
      }
      case 'inspector-preferences.json': {
        return JSON.stringify({
          version: 1,
          data: {
            freeCameraInvertRotation: false,
            autosaveEnabled: false
          }
        })
      }
      default: {
        return ''
      }
    }
  }

  server.handle<IframeStorage.Method.READ_FILE>('read_file', async ({ path }) => {
    console.log('read_file', path)

    if (path in mappings) {
      const hash = mappings[path]
      const buffer = await (await fetch(`https://builder-api.decentraland.org/v1/storage/contents/${hash}`)).arrayBuffer()
      return Buffer.from(buffer)
    }
    const file = getFile(path)
    console.log('file', file)
    const buffer = Buffer.from(file, 'utf-8')
    console.log(buffer)
    return buffer
  })

  server.handle<IframeStorage.Method.EXISTS>('exists', ({ path }) => {
    console.log('exists', path)
    return Promise.resolve(true)
  })

  server.handle<IframeStorage.Method.LIST>('list', ({ path }) => {
    // const allPaths =
    const paths = [...Object.keys(mappings), 'assets/scene/main.composite']

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

    console.log('list', path, files)
    return Promise.resolve(files)
  })

  server.handle<IframeStorage.Method.WRITE_FILE>('write_file', ({ path, content }) => {
    console.log('write_file', path, new TextDecoder().decode(content))
    return Promise.resolve()
  })
}

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
