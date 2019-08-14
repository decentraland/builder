import * as React from 'react'

import { Close, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './SyncToast.types'
import './SyncToast.css'

export default class SyncToast extends React.PureComponent<Props, State> {
  state: State = {
    isSynced: false
  }

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

  render() {
    const {
      syncCount,
      errorCount,
      didDismissSignInToast,
      didDismissSyncedToast,
      isLoggedIn,
      onDismissSignInToast,
      onDismissSyncedToast
    } = this.props
    const { isSynced } = this.state

    const showSynced = isSynced && !didDismissSyncedToast
    const showSignIn = !isLoggedIn && !didDismissSignInToast

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
            {t('sync.sign_in')}
            <Close small onClick={onDismissSignInToast} />
          </div>
        </div>
      )
    }
    return null
  }
}
