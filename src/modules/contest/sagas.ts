import { put, takeLatest, call, select } from 'redux-saga/effects'
import { getState as getStorage } from 'decentraland-dapps/dist/modules/storage/selectors'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { utils } from 'decentraland-commons'

import { SUBMIT_PROJECT_REQUEST, SubmitProjectRequestAction, submitProjectSuccess, submitProjectFailure } from 'modules/contest/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { getState as getUser } from 'modules/user/selectors'
import { Project } from 'modules/project/types'
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
    const user: ReturnType<typeof getUser> = yield select(getUser)

    const project: Omit<Project, 'thumbnail'> = utils.omit(projects[projectId], ['thumbnail'])

    const entry = {
      version: storage.version,
      scene: scenes[project.sceneId],
      project,
      contest,
      user: utils.pick(user, ['id'])
    }

    const analytics = getAnalytics()
    if (contest.ethAddress) {
      analytics.identify(contest.ethAddress, { email: contest.email })
    } else {
      analytics.identify({ email: contest.email })
    }

    yield call(() => api.submitToContest(JSON.stringify(entry)))

    yield put(submitProjectSuccess(projectId, contest))
  } catch (error) {
    yield put(submitProjectFailure(error.message))
  }
}
