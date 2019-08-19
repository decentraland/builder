import { delay, call, select } from 'redux-saga/effects'
import { env } from 'decentraland-commons'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { getEmail } from 'modules/auth/selectors'

const DELIGHTED_DELAY = 180 * 1000
const DELIGHTED_API_KEY = env.get('REACT_APP_DELIGHTED_API_KEY', '')
const isEnabled = !!DELIGHTED_API_KEY

const init = (window as any).initDelighted

export function* handleDelighted() {
  if (!isEnabled) {
    console.warn('Delighted is disabled because DELIGHTED_API_KEY was not found.')
    return
  }
  yield call(() => {
    init(
      window,
      document,
      ['survey', 'reset', 'config', 'init', 'set', 'get', 'event', 'identify', 'track', 'page', 'screen', 'group', 'alias'],
      DELIGHTED_API_KEY,
      'delighted'
    )
  })
  yield delay(DELIGHTED_DELAY)
  const email: string | null = yield select(getEmail)
  yield call(() => {
    const analytics = getAnalytics()
    const delighted = (window as any).delighted
    const payload = {
      recurringPeriod: false,
      properties: {
        anonymous_id: analytics ? analytics.user().anonymousId() : null
      }
    }
    delighted.survey(email ? { email, ...payload } : payload)
  })
}
