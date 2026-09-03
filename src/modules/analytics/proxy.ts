import { AnalyticsSnippetOptions } from 'decentraland-dapps/dist/modules/analytics/snippet'

/**
 * Last known value of the `dapps-seg-alt` kill switch. The analytics middleware is created while the store is built,
 * long before the flags are fetched, so the value that arrives from the flag service is persisted here and the next
 * boot decides with it.
 *
 * The key is shared with the other dapps on purpose: they all read the same flag and the switch has to mean the same
 * thing everywhere.
 */
export const SEGMENT_KILL_SWITCH_KEY = 'dcl-analytics-seg-alt'

const ENABLED = '1'
const DISABLED = '0'

/**
 * The flag service only publishes enabled flags, so an absent flag and a disabled one are indistinguishable. That is
 * what makes this a kill switch: anything other than an explicit "on" keeps the configured proxy, and a deploy while
 * the flag is off changes nothing.
 */
function isKillSwitchEnabled(): boolean {
  try {
    return localStorage.getItem(SEGMENT_KILL_SWITCH_KEY) === ENABLED
  } catch (_error) {
    // Storage can be unavailable (private mode, blocked cookies). Losing the switch must not lose the tracking.
    return false
  }
}

/**
 * Options the analytics middleware needs to route both the analytics.js bundle and the events through the first party
 * proxy, or `undefined` when the kill switch is on or the proxy is not configured, which leaves Segment's own CDN and
 * ingestion endpoint in place.
 *
 * @param analyticsUrl URL of the analytics.js bundle served by the proxy.
 * @param apiHost Host the events are delivered to, without a protocol (`host/basePath`).
 */
export function getAnalyticsProxyOptions(analyticsUrl?: string, apiHost?: string): AnalyticsSnippetOptions | undefined {
  if (isKillSwitchEnabled()) {
    return undefined
  }

  const options: AnalyticsSnippetOptions = {}
  if (analyticsUrl) {
    options.analyticsUrl = analyticsUrl
  }
  if (apiHost) {
    options.apiHost = apiHost
  }

  return Object.keys(options).length > 0 ? options : undefined
}

/**
 * Stores the kill switch value so the next boot can honour it. Called every time the flags are fetched, never on a
 * fetch failure: a flag service outage has to leave the last known value alone.
 */
export function persistSegmentKillSwitch(isEnabled: boolean): void {
  try {
    localStorage.setItem(SEGMENT_KILL_SWITCH_KEY, isEnabled ? ENABLED : DISABLED)
  } catch (_error) {
    // Same as above: an unavailable storage only costs the switch its persistence.
  }
}
