import { add } from 'decentraland-dapps/dist/modules/analytics/utils'
import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'

add(SUBMIT_PROJECT_SUCCESS, 'Contest data', action => {
  const payload = (action as SubmitProjectSuccessAction).payload
  return {
    projectId: payload.projectId,
    email: payload.contest.email,
    ethAddress: payload.contest.ethAddress
  }
})
