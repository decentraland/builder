import { put, takeLatest, call, select } from 'redux-saga/effects'
import { getState as getStorage } from 'decentraland-dapps/dist/modules/storage/selectors'

import { SUBMIT_PROJECT_REQUEST, SubmitProjectRequestAction, submitProjectSuccess, submitProjectFailure } from 'modules/contest/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { api } from 'lib/api'

export function* contestSaga() {
  yield takeLatest(SUBMIT_PROJECT_REQUEST, handleSubmitProjectRequest)
}

function* handleSubmitProjectRequest(action: SubmitProjectRequestAction) {
  try {
    const { projectId, contest } = action.payload
    const storage: ReturnType<typeof getStorage> = yield select(getStorage)
    const projects: ReturnType<typeof getProjects> = yield select(getProjects)
    const scenes: ReturnType<typeof getScenes> = yield select(getScenes)

    const project = projects[projectId]

    const entry = {
      version: storage.version,
      scene: scenes[project.sceneId],
      project,
      contest
    }

    yield call(() => api.submitToContest(JSON.stringify(entry)))

    yield put(submitProjectSuccess(projectId, contest))
  } catch (error) {
    yield put(submitProjectFailure(error.message))
  }
}
