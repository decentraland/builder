import { put, takeLatest, call, select } from 'redux-saga/effects'
import { getState as getStorage } from 'decentraland-dapps/dist/modules/storage/selectors'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { utils } from 'decentraland-commons'

import { SUBMIT_PROJECT_REQUEST, SubmitProjectRequestAction, submitProjectSuccess, submitProjectFailure } from 'modules/contest/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { Project } from 'modules/project/types'
import { getSecret } from 'modules/user/selectors'
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
    const secret: string | null = yield select(getSecret)

    const project: Omit<Project, 'thumbnail'> = utils.omit(projects[projectId], ['thumbnail'])

    const entry = {
      version: storage.version,
      scene: scenes[project.sceneId],
      project,
      contest
    }

    const analytics = getAnalytics()
    if (contest.ethAddress) {
      analytics.identify(contest.ethAddress, { email: contest.email })
    } else {
      analytics.identify({ email: contest.email })
    }

    yield call(() => api.submitToContest(JSON.stringify({ ...entry, secret })))

    yield put(submitProjectSuccess(projectId, contest))
  } catch (error) {
    yield put(submitProjectFailure(error.message))
  }
}
