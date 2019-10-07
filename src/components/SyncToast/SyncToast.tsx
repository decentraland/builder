import * as React from 'react'

import { Close, Button } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { locations } from 'routing/locations'

import { Props, State } from './SyncToast.types'
import './SyncToast.css'

export const SYNC_SIGN_IN_EVENT = 'Sign in from sync toast'

export default class SyncToast extends React.PureComponent<Props, State> {
  state: State = {
    isSynced: false
  }

  analytics = getAnalytics()

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.syncCount > 0 && this.props.syncCount === 0) {
      this.setState({ isSynced: false })
    } else if (nextProps.syncCount === 0 && this.props.syncCount > 0) {
      this.setState({ isSynced: true })
    }
  }

  handleRetry = () => {
    const { onRetry } = this.props
    onRetry()
  }

  handleLogin = () => {
    const { onLogin } = this.props
    this.analytics.track(SYNC_SIGN_IN_EVENT)
    onLogin({
      returnUrl: locations.root()
    })
  }

  render() {
    const {
      syncCount,
      errorCount,
      projectCount,
      didDismissSignInToast,
      didDismissSyncedToast,
      isLoggedIn,
      onDismissSignInToast,
      onDismissSyncedToast
    } = this.props
    const { isSynced } = this.state

    const showSynced = isSynced && !didDismissSyncedToast
    const showSignIn = !isLoggedIn && !didDismissSignInToast && projectCount > 0

    if (syncCount > 0) {
      return (
        <div className="SyncToast">
          <div className="message">{t('sync.loading')}</div>
        </div>
      )
    } else if (errorCount > 0) {
      return (
        <div className="SyncToast">
          <div className="message">
            <div className="error-indicator" />
            {t('sync.error', { errorCount })}
            <Button basic onClick={this.handleRetry}>
              {t('sync.retry')}
            </Button>
          </div>
        </div>
      )
    } else if (showSynced) {
      return (
        <div className="SyncToast">
          <div className="message">
            {t('sync.success')}
            <Close small onClick={onDismissSyncedToast} />
          </div>
        </div>
      )
    } else if (showSignIn) {
      return (
        <div className="SyncToast">
          <div className="message">
            <T
              id="toasts.localstorage"
              values={{
                sign_in: (
                  <span className="sign-in" onClick={this.handleLogin}>
                    {t('global.sign_in')}
                  </span>
                )
              }}
            />
            <Close small onClick={onDismissSignInToast} />
          </div>
        </div>
      )
    }
    return null
  }
}
