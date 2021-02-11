import * as React from 'react'
import { Close } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { Props, State } from './LocalStorageToast.types'

import './LocalStorageToast.css'

export const LOCAL_STORAGE_SIGN_IN_EVENT = 'Sign in from editor toast'
export const LOCALSTORAGE_TOAST_KEY = 'builder-localstorage-signin-toast'
const localStorage = getLocalStorage()

export default class LocalStorageToast extends React.PureComponent<Props, State> {
  state = {
    isVisible: !localStorage.getItem(LOCALSTORAGE_TOAST_KEY) && this.props.isVisible
  }

  analytics = getAnalytics()

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isVisible && !localStorage.getItem(LOCALSTORAGE_TOAST_KEY)) {
      this.setState({ isVisible: true })
    } else if (this.props.isVisible && !nextProps.isVisible) {
      this.setState({ isVisible: false })
    }
  }

  handleClose = () => {
    this.setState({ isVisible: false })
    localStorage.setItem(LOCALSTORAGE_TOAST_KEY, '1')
  }

  handleLogin = () => {
    const { project, onOpenModal } = this.props
    if (project) {
      this.analytics.track(LOCAL_STORAGE_SIGN_IN_EVENT)
      onOpenModal('WalletLoginModal')
    }
  }

  render() {
    if (!this.state.isVisible) {
      return null
    }
    return (
      <div className="LocalStorageToast">
        <T
          id="toasts.localstorage"
          values={{
            sign_in: (
              <span className="sign-in" onClick={this.handleLogin}>
                &nbsp;{t('global.sign_in')}&nbsp;
              </span>
            )
          }}
        />
        <div className="close" onClick={this.handleClose} title={t('global.dismiss')}>
          <Close small />
        </div>
      </div>
    )
  }
}
