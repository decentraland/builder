import { WeeklyStats } from 'modules/stats/types'

// caching the stats promise since it should not change for 24hs. Caching the promise instead of using await so simultaneous calls to the function would result in a single request.
let statsPromise:
  | Promise<
      Record<string, { last_7d: { users: number; sessions: number; median_session_time: number; max_concurrent_users: number | null } }>
    >
  | undefined = undefined

class AnalyticsAPI {
  async fetchWeeklyStats(base: string) {
    if (!statsPromise) {
      statsPromise = fetch('https://cdn-data.decentraland.org/scenes/scene-stats.json').then(resp => resp.json())
    }
    const json = await statsPromise
    const stats = base in json ? json[base]['last_7d'] : null

    const weeklyStats: WeeklyStats = {
      base,
      users: stats ? stats.users : 0,
      sessions: stats ? stats.sessions : 0,
      medianSessionTime: stats ? stats.median_session_time : 0,
      maxConcurrentUsers: stats ? stats.max_concurrent_users || 0 : 0
    }

    return weeklyStats
  }
}

export const analytics = new AnalyticsAPI()
