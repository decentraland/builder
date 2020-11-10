import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { formatTime } from 'lib/date'
import Stats from './Stats'
import { Props } from './SceneStats.types'
import { Loader } from 'decentraland-ui'

export default class SceneStats extends React.PureComponent<Props> {
  componentWillMount() {
    this.fetchStats(this.props.deployment.base)
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.deployment.base !== this.props.deployment.base) {
      this.fetchStats(nextProps.deployment.base)
    }
  }

  fetchStats = (base: string) => {
    const { stats, isLoading, onFetchStats } = this.props
    if (!stats && !isLoading) {
      onFetchStats(base)
    }
  }

  renderValue = (value: string | null, defaultValue: string = '0') => {
    const { isLoading } = this.props
    return !value && isLoading ? <Loader active size="mini" /> : value ? value : defaultValue
  }

  render() {
    const { stats } = this.props
    return (
      <>
        <Stats label={t('analytics.users')}>{this.renderValue(stats && stats.users.toLocaleString())}</Stats>
        <Stats label={t('analytics.sessions')}>{this.renderValue(stats && stats.sessions.toLocaleString())}</Stats>
        <Stats label={t('analytics.median_session_time')}>{this.renderValue(stats && formatTime(stats.medianSessionTime), '0s')}</Stats>
        <Stats label={t('analytics.max_concurrent_users')}>{this.renderValue(stats && stats.maxConcurrentUsers.toLocaleString())}</Stats>
      </>
    )
  }
}
