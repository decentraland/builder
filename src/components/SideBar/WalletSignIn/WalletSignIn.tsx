import React from 'react'
import { WalletIcon, Button } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './WalletSignIn.types'
import './WalletSignIn.css'

export default class WalletSignIn extends React.PureComponent<Props> {
  handleConnect = () => {
    this.props.onConnect!()
  }

  render() {
    const { hasError, isConnecting } = this.props
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }
    return (
      <div className="WalletSignIn">
        <WalletIcon />
        <span className="message">{t('wallet.title')}</span>
        <Button className="connect" primary onClick={this.handleConnect}>
          {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
        </Button>

        <p className={errorClasses}>
          <T id="@dapps.sign_in.error" />
        </p>

        <div className="promo">
          <div className="logo" />
          <span className="header">{t('wallet.promo_title')}</span>
          <span className="message">
            <T
              id="wallet.promo_body"
              values={{
                cta: (
                  <a href="https://www.meetdapper.com/?utm_source=decentraland" target="_blank">
                    {t('wallet.promo_cta')}
                  </a>
                )
              }}
            />
          </span>
        </div>
      </div>
    )
  }
}
