import React from 'react'
import { StarWalletIcon, Button } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './WalletSignIn.types'
import './WalletSignIn.css'

export default class WalletSignIn extends React.PureComponent<Props, State> {
  handleConnect = () => {
    this.props.onConnect!()
  }

  render() {
    const { isConnecting, hasError } = this.props
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }
    return (
      <div className="WalletSignIn">
        <div className="main">
          <StarWalletIcon />
          <span className="message">{t('wallet.title')}</span>
          <Button className="connect" primary onClick={this.handleConnect} disabled={isConnecting}>
            {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
          </Button>

          <p className={errorClasses}>
            <T id="@dapps.sign_in.error" />
          </p>
        </div>
      </div>
    )
  }
}
