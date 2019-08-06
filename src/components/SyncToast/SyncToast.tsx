import * as React from 'react'

import { Props, State } from './SyncToast.types'

import './SyncToast.css'
import { Close, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

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

  handleClose = () => {
    this.setState({ isSynced: false })
  }

  handleRetry = () => {
    const { onRetry } = this.props
    onRetry()
  }

  render() {
    const { syncCount, errorCount } = this.props
    const { isSynced } = this.state
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
              Retry
            </Button>
          </div>
        </div>
      )
    } else if (isSynced) {
      return (
        <div className="SyncToast">
          <div className="message">
            {t('sync.success')}
            <Close small onClick={this.handleClose} />
          </div>
        </div>
      )
    }
    return null
  }
}
