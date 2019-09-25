import { delay, call, select } from 'redux-saga/effects'
import { env } from 'decentraland-commons'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { getEmail } from 'modules/auth/selectors'

const DELIGHTED_DELAY = 180 * 1000
const DELIGHTED_API_KEY = env.get('REACT_APP_DELIGHTED_API_KEY', '')
const isEnabled = !!DELIGHTED_API_KEY

if (isEnabled) {
  // prettier-ignore
  // @ts-ignore
  // tslint:disable-next-line
  window.initDelighted=function(b,c,a,g,e){if(!b[e]){var d=b[e]=[];for(b=0;b<a.length;b++){var f=a[b];d[f]=d[f]||function(a){return function(){var b=Array.prototype.slice.call(arguments);d.push([a,b])}}(f)}d.SNIPPET_VERSION="1.0.1";a=c.createElement("script");a.type="text/javascript";a.async=!0;a.src="https://d2yyd1h5u9mauk.cloudfront.net/integrations/web/v1/library/"+g+"/"+e+".js";c=c.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)}};
}

export function* handleDelighted() {
  if (!isEnabled) {
    console.warn('Delighted is disabled because DELIGHTED_API_KEY was not found.')
    return
  }
  const init = (window as any).initDelighted

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
        anonymous_id: analytics && analytics.user ? analytics.user().anonymousId() : null
      }
    }
    delighted.survey(email ? { email, ...payload } : payload)
  })
}
