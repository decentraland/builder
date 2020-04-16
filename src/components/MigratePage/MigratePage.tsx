import React from 'react'
import { Props, State } from './MigratePage.types'
import Navbar from 'components/Navbar'
import { Page, Button } from 'decentraland-ui'
import Footer from 'components/Footer'
import { locations } from 'routing/locations'
import './MigratePage.css'

export default class MigratePage extends React.PureComponent<Props, State> {
  state = {
    error: null
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.error && !this.state.error) {
      this.setState({
        error: nextProps.error
      })
    } else if (!nextProps.error && this.state.error) {
      this.setState({
        error: null
      })
    }
  }

  renderLogin() {
    const { onLogin } = this.props
    return (
      <div className="login wrapper">
        <div className="message">Please connect your wallet to continue</div>
        <Button primary onClick={() => onLogin()}>
          Connect
        </Button>
      </div>
    )
  }

  renderLegacyLogin() {
    const { onLegacyLogin } = this.props
    return (
      <div className="login-legacy wrapper">
        <div className="message">Please login with your email to continue</div>
        <Button primary onClick={() => onLegacyLogin({ returnUrl: locations.migrate() })}>
          Login
        </Button>
      </div>
    )
  }

  renderMigrate() {
    const { onMigrate, isMigrating } = this.props
    return (
      <div className="migrate wrapper">
        <div className="message">Migrate the proyects under your email account to your wallet account</div>
        <Button primary disabled={isMigrating} onClick={() => onMigrate()}>
          Migrate
        </Button>
      </div>
    )
  }

  render() {
    const { isLoggedIn, isLegacyLoggedIn } = this.props
    const { error } = this.state
    return (
      <>
        <Navbar />
        <Page className="MigratePage">
          {!isLoggedIn ? this.renderLogin() : null}
          {isLoggedIn && !isLegacyLoggedIn ? this.renderLegacyLogin() : null}
          {isLoggedIn && isLegacyLoggedIn ? this.renderMigrate() : null}
          {error ? (
            <div className="error">
              Please install{' '}
              <a href="https://metamask.io" target="_blank" rel="no:opener no:referrer">
                MetaMask
              </a>{' '}
              or other web3 wallet to continue.
            </div>
          ) : null}
        </Page>
        <Footer />
      </>
    )
  }
}
