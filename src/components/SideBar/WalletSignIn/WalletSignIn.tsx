import React from 'react'
import { WalletIcon, Button } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'

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
        <span className="message">Connect your wallet to decorate your scene with crypto-collectibles.</span>
        <Button primary onClick={this.handleConnect}>
          {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
        </Button>

        <p className={errorClasses}>
          <T id="@dapps.sign_in.error" />
        </p>

        <div className="promo">
          <div className="logo" />
          <span className="header">Don’t have a wallet yet?</span>
          <span className="message">Get one from Dapper with a free Purrstige Cat to add to your scene!</span>
        </div>
      </div>
    )
  }
}
