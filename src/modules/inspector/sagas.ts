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
  LoadProjectsSuccessAction,
  LOAD_PROJECTS_FAILURE,
  LOAD_PROJECTS_SUCCESS,
  LOAD_PROJECT_SCENE_FAILURE,
  LOAD_PROJECT_SCENE_SUCCESS
} from 'modules/project/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { OpenInspectorAction, OPEN_INSPECTOR } from './actions'
import { Project } from 'modules/project/types'

export function* inspectorSaga() {
  yield takeEvery(OPEN_INSPECTOR, handleOpenInspector)
}

function* handleOpenInspector(_action: OpenInspectorAction) {
  try {
    const projectId = getProjectId()
    console.log('project id', projectId)
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

function* getProject(projectId: string): any {
  const projects: Record<string, Project> = yield select(getProjects)
  const project = projects[projectId]

  if (project) {
    return project
  }

  const result: { success?: LoadProjectsSuccessAction; failure?: LoadProjectsFailureAction } = yield race({
    success: take(LOAD_PROJECTS_SUCCESS),
    failure: take(LOAD_PROJECTS_FAILURE)
  })

  if (result.success) {
    const _project: Project = yield getProject(projectId)
    return _project
  }

  if (result.failure) {
    console.error(result.failure)
    throw new Error(`Could not load project`)
  }
}
